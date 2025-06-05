'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox';

interface KonvaCanvasProps {
  innerContainerRef: React.RefObject<HTMLDivElement>;
  pageOffsets: React.RefObject<number[]>;
}

export default function KonvaCanvas({ innerContainerRef, pageOffsets }: KonvaCanvasProps) {
  const boundingBoxes = useBoundingBoxStore((state) => state.boundingBoxes);
  const rubricData = useBoundingBoxStore((state) => state.rubricData);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const groupMapRef = useRef<Map<string, Konva.Group>>(new Map());

  useEffect(() => {
    if (!innerContainerRef.current || stageRef.current) return;

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
  }, [innerContainerRef]);

  useEffect(() => {
    const layer = layerRef.current;
    const groupMap = groupMapRef.current;
    if (!layer) return;

    const currentIds = new Set(boundingBoxes.map(b => b.bounding_box_id));
    for (const [id, group] of groupMap.entries()) {
      if (!currentIds.has(id)) {
        group.destroy();
        groupMap.delete(id);
        layer.batchDraw();
      }
    }

    boundingBoxes.forEach((box: any) => {
      const groupId = box.bounding_box_id;
      const existingGroup = groupMap.get(groupId);

      const matchingQuestion = rubricData.questions.find((q: any) => q.bounding_box_id === box.bounding_box_id);
      const newText = box.bounding_box_type === 'question'
        ? `${matchingQuestion?.question_title ?? 'Question'} (${matchingQuestion?.question_point ?? 0} pts)`
        : box.bounding_box_type === 'name'
        ? 'Student Name'
        : 'Student ID';

      const { x, y, width, height } = parsePosition(box.bounding_box_position);
      const yOffset = pageOffsets.current?.[box.bounding_box_page - 1] || 0;
      const adjustedY = y + yOffset;

      if (existingGroup) {
        const titleTextNode = existingGroup.findOne((node: Konva.Node) => node.getClassName() === 'Text') as Konva.Text;
        if (titleTextNode && titleTextNode.text() !== newText) {
          titleTextNode.text(newText);
          layer.batchDraw();
        }
      } else {
        const group = createBoundingBoxGroup(
          { ...box, question_title: matchingQuestion?.question_title, question_point: matchingQuestion?.question_point },
          (shape) => {
            const tr = new Konva.Transformer();
            layer.add(tr);
            tr.nodes([shape]);
            layer.batchDraw();
          }
        );
        group.position({ x, y: adjustedY });
        groupMap.set(groupId, group);
        layer.add(group);
        layer.batchDraw();
      }
    });
  }, [boundingBoxes, rubricData, pageOffsets]);

  useEffect(() => {
    if (innerContainerRef.current && stageRef.current) {
      const newWidth = innerContainerRef.current.offsetWidth;
      const newHeight = innerContainerRef.current.scrollHeight;
      stageRef.current.size({ width: newWidth, height: newHeight });
    }
  }, [innerContainerRef.current?.scrollHeight]);

  return null;
}

function parsePosition(pos: string): { x: number; y: number; width: number; height: number } {
  if (!pos) return { x: 0, y: 0, width: 100, height: 100 };

  const match = pos.match(/\(([^,]+),([^\)]+)\),\(([^,]+),([^\)]+)\)/);
  if (!match) {
    const parts = pos.split(',').map(parseFloat);
    return {
      x: parts[0] || 0,
      y: parts[1] || 0,
      width: parts[2] || 100,
      height: parts[3] || 100,
    };
  }

  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    width: parseFloat(match[3]),
    height: parseFloat(match[4]),
  };
}
