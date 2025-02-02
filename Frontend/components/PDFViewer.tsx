import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container, Loader } from '@mantine/core';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import { useFetchFile } from '../hooks/useFetchFile';
import usePDFViewerStore from '../store/usePDFViewerStore';
import useBoundingBoxStore from '../store/BoundingBox/useBoundingBoxStore';
import { useForm } from '@mantine/form';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

interface PDFViewerProps {
  courseId: string;
  assignmentId: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ courseId, assignmentId, currentPage }) => {
  const { form: fileForm } = useFetchFile({ courseId, assignmentId });
  const { setScaleFactor } = usePDFViewerStore();
  const { boundingBoxes, rubricData } = useBoundingBoxStore(); // Retrieve rubricData for question details
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformerRef = useRef<any>(null);
  const rectRefs = useRef<{ [key: string]: any }>({});
  const renderTaskRef = useRef<any>(null);
  const { updateBoundingBox } = useBoundingBoxStore();

  const form = useForm({
    initialValues: {
      selectedBoxId: null as string | null,
    },
  });

  useEffect(() => {
    const renderPDF = async (pageNum: number) => {
      if (!fileForm.values.pdfUrl) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);

      const scale = 1.5;
      setScaleFactor(scale);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTaskRef.current = page.render({ canvasContext: context!, viewport });

        try {
          await renderTaskRef.current.promise;
          renderTaskRef.current = null;
        } catch (error) {
          console.warn('Render task cancelled or failed:', error);
        }
      }
    };

    renderPDF(currentPage);
  }, [fileForm.values.pdfUrl, currentPage, setScaleFactor]);

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
    const question = rubricData?.questions?.find((q) =>
      q.subquestions?.some((sub) => sub.bounding_box_id === boundingBoxId)
    );
    const subquestion = question?.subquestions?.find(
      (sub) => sub.bounding_box_id === boundingBoxId
    );
    return subquestion
      ? { title: subquestion.subquestion_title, point: subquestion.subquestion_point }
      : { title: question?.question_title || '', point: question?.question_point || 0 };
  };

  if (fileForm.values.loading) return <Loader />;
  if (!fileForm.values.pdfUrl) return <div>No PDF available</div>;

  return (
    <Container style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'auto', border: '1px solid #ccc' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      <Stage
        width={canvasRef.current?.width || 0}
        height={canvasRef.current?.height || 0}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseDown={handleStageClick}
      >
        <Layer>
          {boundingBoxes &&
            Array.isArray(boundingBoxes) &&
            boundingBoxes
              .filter((box) => box.bounding_box_page === currentPage)
              .map((box) => {
                const positions = box.bounding_box_position.match(/\d+/g);
                if (!positions || positions.length < 4) {
                  console.warn(`Invalid bounding_box_position format: ${box.bounding_box_position}`);
                  return null;
                }

                const [x1, y1, x2, y2] = positions.map(Number);
                const width = x2 - x1;
                const height = y2 - y1;

                const { title, point } = getQuestionForBox(box.bounding_box_id);

                return (
                  <React.Fragment key={box.bounding_box_id}>
                    <Rect
                      ref={(node) => {
                        rectRefs.current[box.bounding_box_id] = node;
                      }}
                      x={x1}
                      y={y1}
                      width={width}
                      height={height}
                      fill="rgba(0, 0, 255, 0.3)"
                      stroke="blue"
                      strokeWidth={2}
                      draggable // เปิดใช้งานการลาก
                      onClick={() => form.setFieldValue('selectedBoxId', box.bounding_box_id)}
                      onDragEnd={(e) => {
                        // อัปเดตตำแหน่งของ bounding box ใน store
                        const newX1 = e.target.x();
                        const newY1 = e.target.y();
                        const newX2 = newX1 + width;
                        const newY2 = newY1 + height;

                        // ค้นหาและอัปเดต bounding box
                        const updatedBoundingBox = {
                          ...box,
                          bounding_box_position: `(${newX1},${newY1}),(${newX2},${newY2})`,
                        };
                        updateBoundingBox(box.bounding_box_id, updatedBoundingBox); // ใช้ฟังก์ชันใน store
                      }}
                    />


                    <Rect x={x1} y={y1 - 20} width={width} height={20} fill="gray" />

                    <Text x={x1 + 5} y={y1 - 18} text={`${title}: ${point} point`} fontSize={12} fill="white" fontStyle="bold" />
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
