'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useFetchTemplate } from '@/hooks/BoundingBox/useFetchBoundingBox';
import Konva from 'konva';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';

interface KonvaCanvasProps {
  innerContainerRef: React.RefObject<HTMLDivElement>;
}

export default function KonvaCanvas({ innerContainerRef }: KonvaCanvasProps) {
  // Fetch template data on mount to populate store
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { data: template, isSuccess: isTemplateSuccess } = useFetchTemplate(assignment_id);

  // Store selectors
  const boundingBoxes = useBoundingBoxStore((state) => state.boundingBoxes);
  const rubricData = useBoundingBoxStore((state) => state.rubricData);
  const pageMetas = usePageMetaStore((state) => state.pageMetas);
  const updateBox = useBoundingBoxStore((state) => state.updateBoundingBox);

  // Refs for Konva
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const groupMapRef = useRef<Map<string, Konva.Group>>(new Map());

  // Initialize Konva Stage and Layer
  useEffect(() => {
    if (!innerContainerRef.current || stageRef.current) return;

    const stage = new Konva.Stage({
      container: innerContainerRef.current,
      width: innerContainerRef.current.offsetWidth,
      height: innerContainerRef.current.scrollHeight,
    });
    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;

    stage.on('click', (e) => {
      if (e.target === stage) {
        layer.find('Transformer').forEach((tr) => tr.destroy());
      }
    });
  }, [innerContainerRef]);

  // Draw and update bounding boxes
  useEffect(() => {
    const layer = layerRef.current;
    const groupMap = groupMapRef.current;
    if (!layer || !pageMetas.length || !isTemplateSuccess) return;

    // Map bounding_box_id to question info
    const questionMap = new Map<string, { title: string; point: number }>();
    rubricData.questions.forEach((q: any) => {
      if (q.bounding_box_id) {
        questionMap.set(q.bounding_box_id, { title: q.question_title, point: q.question_point });
      }
      q.subquestions?.forEach((sub: any) => {
        if (sub.bounding_box_id) {
          questionMap.set(sub.bounding_box_id, { title: sub.subquestion_title, point: sub.subquestion_point });
        }
      });
    });

    // Remove deleted boxes
    const currentIds = new Set(boundingBoxes.map((b) => b.bounding_box_id));
    for (const [id, grp] of groupMap.entries()) {
      if (!currentIds.has(id)) {
        grp.destroy();
        groupMap.delete(id);
      }
    }

    // Render or update each bounding box
    boundingBoxes.forEach((box) => {
      const meta = pageMetas.find((m) => m.pageNumber === box.bounding_box_page);
      if (!meta) return;

      const info = questionMap.get(box.bounding_box_id);
      const labelText =
        box.bounding_box_type === 'question'
          ? `${info?.title || 'Question'} (${info?.point || 0} pts)`
          : box.bounding_box_type === 'name'
            ? 'Student Name'
            : 'Student ID';

      // Transform raw coords to canvas coords
      const x = box.point_x * meta.scale;
      const y = box.point_y * meta.scale + meta.offsetY;
      const w = box.width * meta.scale;
      const h = box.height * meta.scale;

      const existingGroup = groupMap.get(box.bounding_box_id);
      if (existingGroup) {
        // update label, position, and size
        const textNode = existingGroup.findOne('.titleText') as Konva.Text;
        if (textNode.text() !== labelText) textNode.text(labelText);
        existingGroup.position({ x, y });
        existingGroup.findOne('.background')?.setAttrs({ width: w, height: h });
      } else {
        // create new group
        const group = createBoundingBoxGroup(
          { ...box, question_title: info?.title || '', question_point: info?.point || 0 },
          () => { }
        );
        group.draggable(true);
        group.on('dragend', () => {
          // get position relative to stage
          const { x: newX, y: newY } = group.position();
          const origX = newX / meta.scale;
          const origY = (newY - meta.offsetY) / meta.scale;
          updateBox(box.bounding_box_id, { point_x: origX, point_y: origY });
        });
        group.on('click', (e) => {
          e.cancelBubble = true;
          layer.find('Transformer').forEach((tr) => tr.destroy());
          const tr = new Konva.Transformer({ rotateEnabled: false });
          layer.add(tr);
          tr.nodes([group]);
        });
        group.position({ x, y });
        group.findOne('.background')?.setAttrs({ width: w, height: h });
        layer.add(group);
        groupMap.set(box.bounding_box_id, group);
      }
    });

    layer.batchDraw();
  }, [boundingBoxes, rubricData, pageMetas, updateBox, isTemplateSuccess]);

  // adjust stage size on container resize
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !innerContainerRef.current) return;
    stage.size({ width: innerContainerRef.current.offsetWidth, height: innerContainerRef.current.scrollHeight });
  }, [innerContainerRef.current?.scrollHeight]);

  return null;
}
