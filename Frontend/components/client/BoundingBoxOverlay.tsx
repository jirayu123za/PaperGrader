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
  scale: number;
  pan: { x: number; y: number };
}

/**
 * Client-only overlay using Konva imperative API.
 * Draws bounding boxes once per data/page change,
 * then updates zoom via stage.scale separated from redraw.
 */
const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  canvasRef,
  assignmentId,
  currentPage,
  scale,
  pan,
}) => {
  // Fetch and sync to store
  const { data: fetchedBoxes, isLoading, error } = useFetchGradebox(assignmentId);
  const storedBoxes = useGradeboxStore((s) => s.bounding_boxes_data);

  // Refs for Konva
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>();
  const layerRef = useRef<Konva.Layer>();

  // Initialize Konva stage and layer once
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

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

  // Draw shapes when data or page change
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    if (!stage || !layer || !canvas || isLoading || error) return;

    // Resize stage to match new canvas size
    stage.width(canvas.width);
    stage.height(canvas.height);

    // Clear and draw new boxes
    layer.removeChildren();
    const boxes: BoundingBox[] = fetchedBoxes ?? storedBoxes;
    const pageBoxes = boxes.filter((b) => b.bounding_box_page === currentPage);
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

  // Update zoom (scale) on stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }, [scale]);

  const canvas = canvasRef.current;
  const width = canvas?.width ?? 0;
  const height = canvas?.height ?? 0;

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
        transform: `translate(${pan.x}px, ${pan.y}px)`,
      }}
    />
  );
};

export default BoundingBoxOverlay;
