'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox';

interface KonvaCanvasProps {
  innerContainerRef: React.RefObject<HTMLDivElement>;
}

export default function KonvaCanvas({ innerContainerRef }: KonvaCanvasProps) {
  const boundingBoxes = useBoundingBoxStore((state) => state.boundingBoxes);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  // เก็บ id ที่เคยถูกวาดแล้ว
  const drawnBoxIds = useRef<Set<string>>(new Set());

  // สร้าง Stage และ Layer ครั้งเดียว
  useEffect(() => {
    if (!innerContainerRef.current || stageRef.current) return;

    const width = innerContainerRef.current.offsetWidth;
    const height = innerContainerRef.current.offsetHeight;

    const stage = new Konva.Stage({
      container: innerContainerRef.current,
      width,
      height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;

    // ล้าง transformer เมื่อ click พื้นหลัง
    stage.on('click', (e) => {
      if (e.target === stage) {
        layer.find('Transformer').forEach((tr) => (tr as Konva.Transformer).nodes([]));
      }
    });
  }, [innerContainerRef]);

  // เพิ่ม box ใหม่เฉพาะอันที่ยังไม่ถูกวาด
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    boundingBoxes.forEach((box) => {
      if (!drawnBoxIds.current.has(box.bounding_box_id)) {
        const group = createBoundingBoxGroup(box, (shape) => {
          const tr = new Konva.Transformer();
          layer.add(tr);
          tr.nodes([shape]);
          layer.batchDraw();
        });

        layer.add(group);
        drawnBoxIds.current.add(box.bounding_box_id);
      }
    });

    layer.batchDraw();
  }, [boundingBoxes]);

  return null;
}
