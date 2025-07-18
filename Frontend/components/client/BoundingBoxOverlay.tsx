"use client";

import React, { useEffect, useRef } from "react";
import Konva from "konva";
import { useFetchGradebox } from "@/hooks/BoundingBox/useFetchGradebox";
import { useGradeboxStore } from "@/store/BoundingBox/useGradeboxStore";

interface BoundingBox {
  bounding_box_id: string;
  bounding_box_page: number;
  point_x: number;
  point_y: number;
  width: number;
  height: number;
  question_id: string;
  sub_question_id?: string;
}

interface BoundingBoxOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  assignmentId: string;
  currentPage: number;
  scale: number; // finalScale used to render PDF
  pan: { x: number; y: number };
}

/**
 * Overlay using Konva imperative API.
 * Draws bounding boxes based on PDF canvas size and final scale.
 */
const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  canvasRef,
  assignmentId,
  currentPage,
  scale,
  pan,
}) => {
  const { data: fetchedBoxes, isLoading, error } = useFetchGradebox(assignmentId);
  const storedBoxes = useGradeboxStore((s) => s.bounding_boxes_data);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  // Initialize stage and layer once
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Create stage matching canvas internal resolution
    const stage = new Konva.Stage({
      container,
      width: canvas.width,
      height: canvas.height,
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    stageRef.current = stage;
    layerRef.current = layer;

    return () => {
      stage.destroy();
    };
  }, [canvasRef]);

  // Draw boxes when data or page change
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    if (!stage || !layer || !canvas || isLoading || error) return;

    // Sync stage size to canvas resolution
    stage.width(canvas.width);
    stage.height(canvas.height);


    // Clear previous shapes
    layer.removeChildren();

    const boxesToUse = fetchedBoxes ?? storedBoxes;
    const pageBoxes = boxesToUse.filter((b) => b.bounding_box_page === currentPage);

    // Draw rectangles
    pageBoxes.forEach((b) => {
      const rect = new Konva.Rect({
        x: b.point_x,
        y: b.point_y,
        width: b.width,
        height: b.height,
        stroke: "red",
        strokeWidth: 2,
        listening: false,
      });
      layer.add(rect);
    });
    layer.batchDraw();
  }, [fetchedBoxes, storedBoxes, currentPage]);

  // Sync stage & container size to PDF canvas แล้วจัดการ zoom/pan ด้วย Konva API
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!stage || !canvas || !container) return;

    // → เรียกขนาดของ wrapper (parent ของ canvas) แทน
    const wrapper = canvas.parentElement;
    const rect = wrapper?.getBoundingClientRect();
    if (!rect) return;

    // 1) ขยาย container ของ overlay ให้ครอบเต็มพื้นที่ของ wrapper
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    container.style.overflow = "visible";

    // 2) ปรับขนาด Konva stage ให้ตรงกับตัว container ใหม่
    stage.width(rect.width);
    stage.height(rect.height);

    // 3) ซูมและเลื่อนกล่องทั้งหมดผ่าน Konva API
    stage.scale({ x: scale, y: scale });
    stage.position({ x: pan.x, y: pan.y });
    stage.batchDraw();
  }, [scale, pan.x, pan.y, currentPage]);



  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        transformOrigin: "0 0",
        overflow: "visible",
      }}
    />
  );
};

export default BoundingBoxOverlay;
