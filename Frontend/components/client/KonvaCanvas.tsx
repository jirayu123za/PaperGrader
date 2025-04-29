'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox'; 

export default function KonvaCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundingBoxes = useBoundingBoxStore((state) => state.boundingBoxes);
  const stageRef = useRef<Konva.Stage>();
  const transformerRef = useRef<Konva.Transformer | null>(null!);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const transformer = new Konva.Transformer();
    layer.add(transformer);
    transformerRef.current = transformer;

    const selectShape = (shape: Konva.Rect | Konva.Group) => {
      transformer.nodes([shape]);
      layer.batchDraw();
    };

    boundingBoxes.forEach((box) => {
      const group = createBoundingBoxGroup(box, selectShape);
      layer.add(group);
    });

    layer.batchDraw();
    stageRef.current = stage;

    return () => {
      stage.destroy();
    };
  }, [boundingBoxes]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
