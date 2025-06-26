'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';


interface KonvaCanvasProps {
  innerContainerRef: React.RefObject<HTMLDivElement>;
}

export default function KonvaCanvas({ innerContainerRef }: KonvaCanvasProps) {
  const boundingBoxes = useBoundingBoxStore((state) => state.boundingBoxes);
  const rubricData = useBoundingBoxStore((state) => state.rubricData);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const groupMapRef = useRef<Map<string, Konva.Group>>(new Map());
  const pageMetas = usePageMetaStore((state) => state.pageMetas);

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
    if (!layer || !pageMetas?.length) return;

    // ✅ Map bounding_box_id → { title, point } จาก rubric ทั้งหมด
    const questionMap = new Map<string, { title: string; point: number }>();
    rubricData.questions.forEach((q: any) => {
      if (q.bounding_box_id) {
        questionMap.set(q.bounding_box_id, {
          title: q.question_title,
          point: q.question_point,
        });
      }
      q.subquestions?.forEach((sub: any) => {
        if (sub.bounding_box_id) {
          questionMap.set(sub.bounding_box_id, {
            title: sub.subquestion_title,
            point: sub.subquestion_point,
          });
        }
      });
    });

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
      const meta = pageMetas.find(p => p.pageNumber === box.bounding_box_page);
      if (!meta) return;

      const matched = questionMap.get(box.bounding_box_id);
      const questionTitle = matched?.title || 'Question';
      const questionPoint = matched?.point || 0;

      const newText =
        box.bounding_box_type === 'question'
          ? `${questionTitle} (${questionPoint} pts)`
          : box.bounding_box_type === 'name'
          ? 'Student Name'
          : 'Student ID';

      const adjustedX = (box.bounding_box_point_x || 0) * meta.scale;
      const adjustedY = (box.bounding_box_point_y || 0) * meta.scale + meta.offsetY;
      const adjustedWidth = (box.bounding_box_width || 100) * meta.scale;
      const adjustedHeight = (box.bounding_box_height || 100) * meta.scale;

      if (existingGroup) {
        const titleTextNode = existingGroup.findOne((node: Konva.Node) => node.getClassName() === 'Text') as Konva.Text;
        if (titleTextNode && titleTextNode.text() !== newText) {
          titleTextNode.text(newText);
          layer.batchDraw();
        }
      } else {
        const group = createBoundingBoxGroup(
          {
            ...box,
            question_title: questionTitle,
            question_point: questionPoint,
          },
          (shape) => {
            const tr = new Konva.Transformer();
            layer.add(tr);
            tr.nodes([shape]);
            layer.batchDraw();
          }
        );
        group.position({ x: adjustedX, y: adjustedY });
        group.findOne('.background')?.setAttrs({ width: adjustedWidth, height: adjustedHeight });

        groupMap.set(groupId, group);
        layer.add(group);
        layer.batchDraw();
      }
    });
  }, [boundingBoxes, rubricData, pageMetas]);

  useEffect(() => {
    if (innerContainerRef.current && stageRef.current) {
      const newWidth = innerContainerRef.current.offsetWidth;
      const newHeight = innerContainerRef.current.scrollHeight;
      stageRef.current.size({ width: newWidth, height: newHeight });
    }
  }, [innerContainerRef.current?.scrollHeight]);

  return null;
}
