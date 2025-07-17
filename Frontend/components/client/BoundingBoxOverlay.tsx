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
        x: b.point_x * scale,
        y: b.point_y * scale,
        width: b.width * scale,
        height: b.height * scale,
        stroke: "red",
        strokeWidth: 2,
        listening: false,
      });
      layer.add(rect);
    });
    layer.batchDraw();
  }, [fetchedBoxes, storedBoxes, currentPage]);

  // Update zoom by CSS transform on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
  }, [scale, pan.x, pan.y]);

  const canvas = canvasRef.current;
  const width = canvas?.clientWidth ?? 0;
  const height = canvas?.clientHeight ?? 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        transformOrigin: "0 0",
      }}
    />
  );
};

export default BoundingBoxOverlay;
