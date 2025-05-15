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

  useEffect(() => {
    if (!innerContainerRef.current) return;

    const width = innerContainerRef.current.offsetWidth;
    const height = innerContainerRef.current.scrollHeight;

    const stage = new Konva.Stage({
      container: innerContainerRef.current,
      width,
      height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;


    stage.on('click', (e) => {
      if (e.target === stage) {
        layer.find('Transformer').forEach((tr) => (tr as Konva.Transformer).nodes([]));
      }
    });

    boundingBoxes.forEach((box) => {
      const group = createBoundingBoxGroup(box, (shape) => {
        const tr = new Konva.Transformer();
        layer.add(tr);
        tr.nodes([shape]);
        layer.batchDraw();
      });
      layer.add(group);
    });

    layer.batchDraw();
  }, [boundingBoxes]);


  return null; 
}
