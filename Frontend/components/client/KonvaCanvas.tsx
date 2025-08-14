'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { useFetchTemplate } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useParams } from 'next/navigation';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';
import { createBoundingBoxGroup } from '@/components/INS/INSProcess/Right/Boundingbox/createBoundingBox';

interface KonvaCanvasProps {
  innerContainerRef: React.RefObject<HTMLDivElement>;
}


function attachTransformer(layer: Konva.Layer, node: Konva.Node) {

  layer.find('Transformer').forEach((tr) => tr.destroy());
  const tr = new Konva.Transformer({
    rotateEnabled: false,
    ignoreStroke: true,
    boundBoxFunc: (oldBox, newBox) => {

      const min = 10;
      const w = Math.max(newBox.width, min);
      const h = Math.max(newBox.height, min);
      return { ...newBox, width: w, height: h };
    },
  });
  layer.add(tr);
  tr.nodes([node]);
  layer.batchDraw();
}

export default function KonvaCanvas({ innerContainerRef }: KonvaCanvasProps) {
  const { boundingBoxes, rubricData, updateBoundingBox } = useBoundingBoxStore();
  const { pageMetas } = usePageMetaStore();

  const params = useParams();
  const assignment_id = (params as any).assignment_id as string;
  const { isSuccess: isTemplateSuccess } = useFetchTemplate(assignment_id);

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const groupMapRef = useRef<Map<string, Konva.Group>>(new Map());


  useEffect(() => {
    if (!innerContainerRef.current) return;
    const container = innerContainerRef.current;

    const stage = new Konva.Stage({
      container,
      width: container.offsetWidth,
      height: container.scrollHeight,
    });
    const layer = new Konva.Layer();
    stage.add(layer);


    stage.on('click', (e) => {
      if (e.target === stage) {
        layer.find('Transformer').forEach((tr) => tr.destroy());
        layer.draw();
      }
    });

    stageRef.current = stage;
    layerRef.current = layer;

    return () => {
      stage.destroy();
      stageRef.current = null;
      layerRef.current = null;
      groupMapRef.current.clear();
    };
  }, [innerContainerRef]);


  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !innerContainerRef.current) return;
    stage.size({
      width: innerContainerRef.current.offsetWidth,
      height: innerContainerRef.current.scrollHeight,
    });
  }, [innerContainerRef.current?.scrollHeight]);


  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !isTemplateSuccess || !pageMetas.length) return;

    const currentIds = new Set(boundingBoxes.map((b: any) => b.bounding_box_id));
    for (const [id, group] of groupMapRef.current) {
      if (!currentIds.has(id)) {
        group.destroy();           
        groupMapRef.current.delete(id);
      }
    }

    layer.batchDraw();

    
    const labelMap = new Map<string, { title: string; point: number }>();
    rubricData.questions.forEach((q: any) => {
      // ถ้ามี subquestions แล้ว ไม่ตั้ง label ที่ระดับ question
      if ((!q.subquestions || q.subquestions.length === 0) && q.bounding_box_id) {
        labelMap.set(q.bounding_box_id, {
          title: q.question_title ?? '',
          point: q.question_point ?? 0,
        });
      }
      (q.subquestions ?? []).forEach((s: any) => {
        if (s?.bounding_box_id) {
          labelMap.set(s.bounding_box_id, {
            title: s.subquestion_title ?? '',
            point: s.subquestion_point ?? 0,
          });
        }
      });
    });

    // เลือกเฉพาะกล่อง question ที่ถูกใช้งานจริง
    const usedIds = new Set<string>();
    rubricData.questions.forEach((q: any) => {
      if (!q.subquestions || q.subquestions.length === 0) {
        if (q.bounding_box_id) usedIds.add(q.bounding_box_id);
      }
      (q.subquestions ?? []).forEach((s: any) => {
        if (s?.bounding_box_id) usedIds.add(s.bounding_box_id);
      });
    });
    const boxesToRender = boundingBoxes.filter((b: any) => {
      if (b.bounding_box_type === 'question') {
        return usedIds.has(b.bounding_box_id);
      }
      return true; // name/id แสดงทั้งหมด
    });
const groups = groupMapRef.current;

    boxesToRender.forEach((box: any) => {
      const meta = pageMetas.find((m: any) => m.pageNumber === box.bounding_box_page);
      if (!meta) return;

      const info = labelMap.get(box.bounding_box_id);
      const defaultLabel =
        box.bounding_box_type === 'name'
          ? 'Student Name'
          : box.bounding_box_type === 'id'
            ? 'Student ID'
            : (info?.title || 'Question');


      const x = box.point_x * meta.scale;
      const y = box.point_y * meta.scale + meta.offsetY;
      const w = box.width * meta.scale;
      const h = box.height * meta.scale;

      const existing = groups.get(box.bounding_box_id);
      if (existing) {

        existing.position({ x, y });
        const bg = existing.findOne('.background') as Konva.Rect;
        if (bg) {
          bg.width(w);
          bg.height(h);
        }
        const bar = existing.findOne('.titleBar') as Konva.Rect;
        if (bar) bar.width(w);
        const txt = existing.findOne('.titleText') as Konva.Text;
        if (txt) {
          txt.text(defaultLabel);
          txt.width(160);
          txt.scale({ x: 1, y: 1 });
        }
      } else {

        const group = createBoundingBoxGroup(
          {
            bounding_box_id: box.bounding_box_id,
            bounding_box_type: box.bounding_box_type,
            bounding_box_page: box.bounding_box_page,
            point_x: x,
            point_y: y,
            width: w,
            height: h,
            question_title: defaultLabel,
            question_point: info?.point ?? 0,
          },
          (node) => attachTransformer(layer, node)
        );


        group.draggable(true);
        group.on('dragend', () => {
          const metaNow = pageMetas.find((m: any) => m.pageNumber === box.bounding_box_page);
          if (!metaNow) return;
          const { x: gx, y: gy } = group.position();
          const origX = gx / metaNow.scale;
          const origY = (gy - metaNow.offsetY) / metaNow.scale;
          updateBoundingBox(box.bounding_box_id, { point_x: origX, point_y: origY });
        });


        group.on('click', (e) => {
          const bg = group.findOne('.background') as Konva.Rect;
          if (bg) attachTransformer(layer, bg);
          e.cancelBubble = true;
          layer.batchDraw();
        });

        const bg = group.findOne('.background') as Konva.Rect;
        if (bg) {
          bg.on('transformend', () => {
            const metaNow = pageMetas.find((m: any) => m.pageNumber === box.bounding_box_page);
            if (!metaNow) return;

            const newWCanvas = bg.width() * bg.scaleX();
            const newHCanvas = bg.height() * bg.scaleY();

            bg.scale({ x: 1, y: 1 });
            group.scale({ x: 1, y: 1 });
            bg.width(newWCanvas);
            bg.height(newHCanvas);


            const bar = group.findOne('.titleBar') as Konva.Rect;
            if (bar) bar.width(newWCanvas);
            const txt = group.findOne('.titleText') as Konva.Text;
            if (txt) {
              txt.width(160);
              txt.scale({ x: 1, y: 1 });
            }


            const { x: gx, y: gy } = group.position();
            updateBoundingBox(box.bounding_box_id, {
              width: newWCanvas / metaNow.scale,
              height: newHCanvas / metaNow.scale,
              point_x: gx / metaNow.scale,
              point_y: (gy - metaNow.offsetY) / metaNow.scale,
            });

            layer.batchDraw();
          });
        }

        groups.set(box.bounding_box_id, group);
        layer.add(group);
      }
    });

    layer.batchDraw();
  }, [boundingBoxes, rubricData, pageMetas, isTemplateSuccess, updateBoundingBox]);

  return null;
}
