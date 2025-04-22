"use client";

import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import usePDFViewerStore from '../store/usePDFViewerStore';
import useBoundingBoxStore from '../store/BoundingBox/useBoundingBoxStore';
import dynamic from 'next/dynamic';
import { Container } from '@mantine/core';
import { useFetchFile } from '../hooks/useFetchFile';
import { useForm } from '@mantine/form';
import { useParams } from 'next/navigation';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const KonvaCanvas = dynamic(() => import('./client/KonvaCanvas'), {
  ssr: false,
});

const PDFViewer: React.FC = () => {
  const params = useParams();
  const courseId = params.course_id as string;
  const assignmentId = params.assignment_id as string;

  const { form: fileForm } = useFetchFile({ courseId, assignmentId });
  const { setScaleFactor } = usePDFViewerStore();
  const { boundingBoxes, rubricData, updateBoundingBox } = useBoundingBoxStore();

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const rectRefs = useRef<{ [key: string]: any }>({});
  const renderTaskRef = useRef<any>(null);
  const pdfPagesRef = useRef<{ [key: number]: HTMLCanvasElement }>({});

  const form = useForm({
    initialValues: {
      selectedBoxId: null as string | null,
      stageSize: { width: 0, height: 0 },
    },
  });

  useEffect(() => {
    const renderPDF = async () => {
      if (!fileForm.values.pdfUrl || !pdfContainerRef.current) return;

      const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      pdfContainerRef.current.innerHTML = '';

      Object.keys(pdfPagesRef.current).forEach((pageNum) => {
        if (Number(pageNum) > numPages) {
          delete pdfPagesRef.current[Number(pageNum)];
        }
      });

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        setScaleFactor(scale);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pdfPagesRef.current[pageNum] = canvas;
        if (!pdfContainerRef.current) {
          console.warn("pdfContainerRef.current is null, skipping appendChild.");
          return;
        }
        pdfContainerRef.current.appendChild(canvas);

        const context = canvas.getContext('2d');
        renderTaskRef.current = page.render({ canvasContext: context!, viewport });

        try {
          await renderTaskRef.current.promise;
        } catch (error) {
          console.warn('Render task cancelled or failed:', error);
        }
      }
    };
    renderPDF();
  }, [fileForm.values.pdfUrl, setScaleFactor]);

  // useEffect(() => {
  //   if (form.values.selectedBoxId && transformerRef.current) {
  //     const selectedNode = rectRefs.current[form.values.selectedBoxId];
  //     if (selectedNode) {
  //       transformerRef.current.nodes([selectedNode]);
  //       transformerRef.current.getLayer().batchDraw();
  //     } else {
  //       transformerRef.current?.detach();
  //       transformerRef.current?.getLayer().batchDraw();
  //     }
  //   }
  // }, [form.values.selectedBoxId, boundingBoxes]);

  // useEffect(() => {
  //   const updateStageSize = () => {
  //     if (!pdfPagesRef.current[1]) return;

  //     const firstCanvas = pdfPagesRef.current[1].getBoundingClientRect();
  //     form.setFieldValue("stageSize", {
  //       width: firstCanvas.width,
  //       height: Object.values(pdfPagesRef.current).reduce((sum, canvas) => sum + canvas.height, 0),
  //     });
  //   };

  //   updateStageSize();
  //   window.addEventListener("resize", updateStageSize);
  //   return () => window.removeEventListener("resize", updateStageSize);
  // }, [pdfPagesRef]);

  // const handleStageClick = (e: any) => {
  //   if (e.target === e.target.getStage()) {
  //     form.setFieldValue('selectedBoxId', null);
  //     transformerRef.current?.detach();
  //     transformerRef.current?.getLayer().batchDraw();
  //   }
  // };

  // const getQuestionForBox = (boundingBoxId: string) => {
  //   const question = rubricData?.questions?.find((q) => q.bounding_box_id === boundingBoxId);
  //   return question ? { title: question.question_title, point: question.question_point } : { title: '', point: 0 };
  // };

  // if (fileForm.values.loading) return <Loader />;
  // if (!fileForm.values.pdfUrl) return <div>No PDF available</div>;

  // const normalizeBoundingBoxPosition = (position: string, boundingBoxPage: number) => {
  //   const positions = position.match(/-?\d+(\.\d+)?/g);
  //   if (!positions || positions.length < 4) return { x: 0, y: 0, width: 50, height: 50 };

  //   let [x1, y1, x2, y2] = positions.map(Number);
  //   if (x1 > x2) [x1, x2] = [x2, x1];
  //   if (y1 > y2) [y1, y2] = [y2, y1];

  //   return {
  //     x: x1,
  //     y: y1 + (boundingBoxPage - 1) * form.values.stageSize.height,
  //     width: x2 - x1,
  //     height: y2 - y1,
  //   };
  // };

  return (
    <Container style={{ height: '100vh', border: '1px solid #ccc' }}>
      <div ref={pdfContainerRef} />
        <KonvaCanvas
          boundingBoxes={boundingBoxes}
          transformerRef={transformerRef}
          rectRefs={rectRefs}
          form={form}
          pdfPagesRef={pdfPagesRef}
          // getQuestionForBox={getQuestionForBox}
          // normalizeBoundingBoxPosition={normalizeBoundingBoxPosition}
          updateBoundingBox={updateBoundingBox}
        />
    </Container>
  );
};

export default PDFViewer;
