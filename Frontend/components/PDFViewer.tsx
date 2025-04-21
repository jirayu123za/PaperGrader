"use client";

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

      pdfContainerRef.current.innerHTML = ''; // ล้างค่าเดิมก่อน render ใหม่

      // ✅ ป้องกัน pdfPagesRef มีค่าเกิน numPages
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
          console.warn("❌ pdfContainerRef.current is null, skipping appendChild.");
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

  useEffect(() => {
    const updateStageSize = () => {
      if (!pdfPagesRef.current[1]) return;

      const firstCanvas = pdfPagesRef.current[1].getBoundingClientRect();
      form.setFieldValue("stageSize", {
        width: firstCanvas.width,
        height: Object.values(pdfPagesRef.current).reduce((sum, canvas) => sum + canvas.height, 0),
      });
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, [pdfPagesRef]);



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

  const normalizeBoundingBoxPosition = (position: string, boundingBoxPage: number) => {
    const positions = position.match(/-?\d+(\.\d+)?/g);
    if (!positions || positions.length < 4) return { x: 0, y: 0, width: 50, height: 50 };

    let [x1, y1, x2, y2] = positions.map(Number);
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];

    return {
      x: x1,
      y: y1 + (boundingBoxPage - 1) * form.values.stageSize.height, // ✅ ใช้ boundingBoxPage ที่รับมา
      width: x2 - x1,
      height: y2 - y1,
    };
  };



  return (
    <Container style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'auto', border: '1px solid #ccc' }}>
      <div ref={pdfContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }} />

      <Stage
        width={form.values.stageSize.width}
        height={form.values.stageSize.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseDown={handleStageClick}
      >
        <Layer>
          {boundingBoxes &&
            boundingBoxes.map((box) => {
              if (!box.bounding_box_position || !pdfPagesRef.current[box.bounding_box_page]) return null;

              const { x, y, width, height } = normalizeBoundingBoxPosition(box.bounding_box_position, box.bounding_box_page);
              const { title, point } = getQuestionForBox(box.bounding_box_id);

              const displayTitle = box.bounding_box_type === 'NAME' ? 'Name' :
                box.bounding_box_type === 'STUDENTID' ? 'Student ID' : `${title}: ${point} point`;

              const color = box.bounding_box_type === 'NAME' ? 'rgba(0, 255, 0, 0.3)' :
                box.bounding_box_type === 'STUDENTID' ? 'rgba(255, 165, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';

              const strokeColor = box.bounding_box_type === 'NAME' ? 'green' :
                box.bounding_box_type === 'STUDENTID' ? 'orange' : 'blue';

              return (
                <React.Fragment key={box.bounding_box_id}>
                  <Rect
                    ref={(node) => { rectRefs.current[box.bounding_box_id] = node; }}
                    x={x}
                    y={y + (box.bounding_box_page - 1) * pdfPagesRef.current[1].height}
                    width={width}
                    height={height}
                    fill={color}
                    stroke={strokeColor}
                    strokeWidth={2}
                    draggable
                    onClick={() => form.setFieldValue('selectedBoxId', box.bounding_box_id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      const pageCanvas = pdfPagesRef.current[box.bounding_box_page];

                      if (!pageCanvas) return;

                      const pageHeight = pdfPagesRef.current[1].height;
                      const maxX = pageCanvas.width - width; // จำกัดขอบเขตด้านขวา
                      const maxY = pageCanvas.height - height; // จำกัดขอบเขตด้านล่าง

                      let newX = Math.max(0, Math.min(node.x(), maxX)); // ไม่ให้เกินขอบซ้ายและขวา
                      let newY = node.y();

                      // ตรวจสอบว่าถูกลากไปหน้าอื่นหรือไม่
                      let newPage = box.bounding_box_page;
                      if (newY < (newPage - 1) * pageHeight) {
                        newPage = Math.max(1, newPage - 1); // ไปหน้าก่อนหน้า
                      } else if (newY + height > newPage * pageHeight) {
                        newPage = Math.min(Object.keys(pdfPagesRef.current).length, newPage + 1); // ไปหน้าถัดไป
                      }

                      // ปรับค่า Y ตามหน้าใหม่
                      newY = Math.max((newPage - 1) * pageHeight, Math.min(newY, newPage * pageHeight - height));

                      node.x(newX);
                      node.y(newY);

                      updateBoundingBox(box.bounding_box_id, {
                        bounding_box_position: `(${newX},${newY - (newPage - 1) * pageHeight},${newX + width},${newY - (newPage - 1) * pageHeight + height})`,
                        bounding_box_page: newPage,
                      });
                    }}
                  />

                  <Rect x={x} y={y - 25 + (box.bounding_box_page - 1) * pdfPagesRef.current[1].height} width={width} height={22} fill="gray" opacity={0.7} />
                  <Text x={x + 5} y={y - 18 + (box.bounding_box_page - 1) * pdfPagesRef.current[1].height} text={displayTitle} fontSize={12} fill="white" fontStyle="bold" />
                </React.Fragment>
              );
            })}
          {Object.keys(pdfPagesRef.current).map((pageNumStr, index) => {
            const pageNum = Number(pageNumStr);
            if (!pdfPagesRef.current[pageNum]) return null;

            const yOffset = (pageNum - 1) * pdfPagesRef.current[1].height; // คำนวณตำแหน่งเส้น
            return (
              <React.Fragment key={`page-separator-${pageNum}`}>
                {/* เส้นแบ่งหน้า */}
                <Line
                  points={[0, yOffset + pdfPagesRef.current[pageNum].height, pdfPagesRef.current[pageNum].width, yOffset + pdfPagesRef.current[pageNum].height]}
                  stroke=""
                  strokeWidth={2}
                />
                {/* หมายเลขหน้า */}
                <Text
                  x={pdfPagesRef.current[pageNum].width / 2 - 20}
                  y={yOffset + pdfPagesRef.current[pageNum].height + 5}
                  text={`Page ${pageNum}`}
                  fontSize={14}
                  fill=""
                  fontStyle="bold"
                />
              </React.Fragment>
            );
          })}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </Container>
  );
};

export default PDFViewer;
