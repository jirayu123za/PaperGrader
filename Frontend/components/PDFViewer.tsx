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
  const { boundingBoxes } = useBoundingBoxStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformerRef = useRef<any>(null);
  const rectRefs = useRef<{ [key: string]: any }>({});
  const renderTaskRef = useRef<any>(null);

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
      }
    }
  }, [form.values.selectedBoxId]);

  const handleStageClick = (e: any) => {
    // ยกเลิกการเลือกถ้าคลิกนอก bounding box
    if (e.target === e.target.getStage()) {
      form.setFieldValue('selectedBoxId', null);
    }
  };

  if (fileForm.values.loading) return <Loader />;
  if (!fileForm.values.pdfUrl) return <div>No PDF available</div>;

  return (
    <Container style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'auto', border: '1px solid #ccc' }}>
      {/* PDF Canvas */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Overlay สำหรับ Bounding Box */}
      <Stage
        width={canvasRef.current?.width || 0}
        height={canvasRef.current?.height || 0}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseDown={handleStageClick} // ตรวจจับการคลิกนอก bounding box
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

                return (
                  <React.Fragment key={box.bounding_box_id}>
                  {/* Rect */}
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
                    onClick={() => form.setFieldValue('selectedBoxId', box.bounding_box_id)}
                  />
                
                  {/* Header Bar */}
                  <Rect
                    x={x1}
                    y={y1 - 20} // แสดงแถบเหนือ bounding box
                    width={width}
                    height={20}
                    fill="gray"
                  />
                
                  {/* Text for Question and Point */}
                  <Text
                    x={x1 + 5}
                    y={y1 - 18} // แสดงข้อความในแถบ Header
                    text={`${box.question}: ${box.point} point`}
                    fontSize={12}
                    fill="white"
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
