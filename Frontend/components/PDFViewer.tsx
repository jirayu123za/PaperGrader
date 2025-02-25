import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container, Loader } from '@mantine/core';
import { Stage, Layer, Rect, Transformer, Text, Line } from 'react-konva';
import { useFetchFile } from '../hooks/useFetchFile';
import usePDFViewerStore from '../store/usePDFViewerStore';
import useBoundingBoxStore from '../store/BoundingBox/useBoundingBoxStore';
import { useForm } from '@mantine/form';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

interface PDFViewerProps {
  courseId: string;
  assignmentId: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ courseId, assignmentId }) => {
  const { form: fileForm } = useFetchFile({ courseId, assignmentId });
  const { setScaleFactor } = usePDFViewerStore();
  const { boundingBoxes, rubricData, updateBoundingBox } = useBoundingBoxStore();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const rectRefs = useRef<{ [key: string]: any }>({});
  const renderTaskRef = useRef<any>(null);
  const pdfPagesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pageHeights = useRef<Map<number, number>>(new Map());

  const form = useForm({
    initialValues: {
      selectedBoxId: null as string | null,
    },
  });

  useEffect(() => {
    const renderPDF = async () => {
      if (!fileForm.values.pdfUrl || !pdfContainerRef.current) return;

      const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      pdfContainerRef.current.innerHTML = ''; // ล้างค่าเดิมก่อน render ใหม่
      let totalHeight = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        setScaleFactor(scale);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pdfPagesRef.current.set(pageNum, canvas);
        pageHeights.current.set(pageNum, totalHeight); // บันทึกตำแหน่ง Y ของแต่ละหน้า
        totalHeight += viewport.height;

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

  useEffect(() => {
    if (form.values.selectedBoxId && transformerRef.current) {
      const selectedNode = rectRefs.current[form.values.selectedBoxId];
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current?.detach();
        transformerRef.current?.getLayer().batchDraw();
      }
    }
  }, [form.values.selectedBoxId, boundingBoxes]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      form.setFieldValue('selectedBoxId', null);
      transformerRef.current?.detach();
      transformerRef.current?.getLayer().batchDraw();
    }
  };

  const getQuestionForBox = (boundingBoxId: string) => {
    const question = rubricData?.questions?.find((q) => q.bounding_box_id === boundingBoxId);
    return question ? { title: question.question_title, point: question.question_point } : { title: '', point: 0 };
  };

  if (fileForm.values.loading) return <Loader />;
  if (!fileForm.values.pdfUrl) return <div>No PDF available</div>;

  const normalizeBoundingBoxPosition = (position: string) => {
    const positions = position.match(/-?\d+(\.\d+)?/g);
    if (!positions || positions.length < 4) return { x: 0, y: 0, width: 50, height: 50 };

    let [x1, y1, x2, y2] = positions.map(Number);
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];

    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  };

  return (
    <Container style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'auto', border: '1px solid #ccc' }}>
      <div ref={pdfContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }} />

      <Stage 
        width={pdfPagesRef.current.get(1)?.width || 0} 
        height={Array.from(pdfPagesRef.current.values()).reduce((sum, canvas) => sum + canvas.height, 0)}
        style={{ position: 'absolute', top: 0, left: 0 }} 
        onMouseDown={handleStageClick}
      >
        <Layer>
          {/* ✅ เส้นแบ่งหน้า PDF ที่ถูกต้อง */}
          {Array.from(pageHeights.current.entries()).map(([page, yPosition]) => {
            const pageCanvas = pdfPagesRef.current.get(page);
            if (!pageCanvas) return null;
            const pageBottom = yPosition + pageCanvas.height;

            return (
              <Line
                key={`page-separator-${page}`}
                points={[0, pageBottom, pageCanvas.width, pageBottom]}
                stroke="red"
                strokeWidth={2}
                dash={[10, 5]}
              />
            );
          })}

          {/* ✅ Bounding Box */}
          {boundingBoxes.map((box) => {
            if (!box.bounding_box_position || !pdfPagesRef.current.get(box.bounding_box_page)) return null;

            const { x, y, width, height } = normalizeBoundingBoxPosition(box.bounding_box_position);
            const { title, point } = getQuestionForBox(box.bounding_box_id);
            const pageOffset = pageHeights.current.get(box.bounding_box_page) || 0;

            return (
              <Rect 
                key={box.bounding_box_id}
                x={x} y={y + pageOffset} width={width} height={height} 
                fill="rgba(0, 0, 255, 0.3)" stroke="blue" strokeWidth={2}
                draggable
                onClick={() => form.setFieldValue('selectedBoxId', box.bounding_box_id)}
              />
            );
          })}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </Container>
  );
};

export default PDFViewer;
