import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container } from '@mantine/core';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import usePDFViewerStore from '../store/usePDFViewerStore';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

interface BoundingBox {
  id: number;
  questionId: string;
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
  imageData?: string | null; // เพิ่มฟิลด์สำหรับเก็บภาพที่ครอบ
}

interface PDFViewerProps {
  fileUrl: string;
  assignmentId: string;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, newBox: BoundingBox) => void;
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
  readOnly?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  assignmentId,
  boundingBoxes,
  updateBoundingBox,
  setBoundingBoxes,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const { scaleFactor, setScaleFactor, selectedShapeIndex, setSelectedShapeIndex } = usePDFViewerStore();

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      setScaleFactor(scale);

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        setCanvasSize({ width: viewport.width, height: viewport.height });

        await page.render({
          canvasContext: context!,
          viewport,
        }).promise;
      }
    };

    renderPDF();
  }, [fileUrl, setScaleFactor]);

  useEffect(() => {
    const savedBoxes = localStorage.getItem(`boundingBoxes-${assignmentId}`);
    if (savedBoxes) {
      try {
        const parsedBoxes = JSON.parse(savedBoxes);
        if (Array.isArray(parsedBoxes)) {
          const updatedBoxes = parsedBoxes.map((box: BoundingBox) => ({
            ...box,
            imageData: extractImageData(box), // ดึงภาพสำหรับแต่ละ BoundingBox
          }));
          setBoundingBoxes(updatedBoxes);
          localStorage.setItem(`boundingBoxes-${assignmentId}`, JSON.stringify(updatedBoxes)); // บันทึกข้อมูลใหม่
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, [assignmentId, setBoundingBoxes]);
  

  // ฟังก์ชันดึงภาพที่ครอบโดย bounding box
  const extractImageData = (box: BoundingBox): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scale = scaleFactor;

    // คำนวณขอบเขตของ bounding box บน canvas
    const x = box.topLeft.x * scale;
    const y = box.topLeft.y * scale;
    const width = (box.bottomRight.x - box.topLeft.x) * scale;
    const height = (box.bottomRight.y - box.topLeft.y) * scale;

    // สร้าง canvas ชั่วคราวเพื่อดึงภาพ
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // วาดภาพเฉพาะบริเวณ bounding box
      tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
      return tempCanvas.toDataURL(); // ส่งกลับ Base64
    }

    return null;
  };

  const handleDragEnd = (index: number, e: any) => {
    const box = boundingBoxes[index];
    const width = box.bottomRight.x - box.topLeft.x;
    const height = box.bottomRight.y - box.topLeft.y;

    const newTopLeftX = e.target.x() / scaleFactor;
    const newTopLeftY = e.target.y() / scaleFactor;

    const updatedBox = {
      ...box,
      topLeft: {
        x: newTopLeftX,
        y: newTopLeftY,
      },
      bottomRight: {
        x: newTopLeftX + width,
        y: newTopLeftY + height,
      },
    };

    const imageData = extractImageData(updatedBox); // ดึงภาพใหม่หลังย้ายตำแหน่ง
    updateBoundingBox(index, { ...updatedBox, imageData });
  };

  const handleTransformEnd = (index: number) => {
    const node = stageRef.current.findOne(`#box-${index}`);
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const box = boundingBoxes[index];

    const newWidth = (box.bottomRight.x - box.topLeft.x) * scaleX;
    const newHeight = (box.bottomRight.y - box.topLeft.y) * scaleY;

    const newBottomRightX = box.topLeft.x + newWidth;
    const newBottomRightY = box.topLeft.y + newHeight;

    node.scaleX(1);
    node.scaleY(1);

    const updatedBox = {
      ...box,
      bottomRight: {
        x: newBottomRightX,
        y: newBottomRightY,
      },
    };

    const imageData = extractImageData(updatedBox); // ดึงภาพใหม่หลังปรับขนาด
    updateBoundingBox(index, { ...updatedBox, imageData });
  };

  return (
    <Container
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'auto',
        border: '1px solid #ccc',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        ref={stageRef}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedShapeIndex(null);
          }
        }}
      >
        <Layer>
          {boundingBoxes.map((box, index) => (
            <React.Fragment key={index}>
              <Rect
                id={`box-${index}`}
                x={box.topLeft.x * scaleFactor}
                y={box.topLeft.y * scaleFactor}
                width={(box.bottomRight.x - box.topLeft.x) * scaleFactor}
                height={(box.bottomRight.y - box.topLeft.y) * scaleFactor}
                fill={
                  box.type === 'NAME'
                    ? 'rgba(0, 255, 0, 0.2)'
                    : box.type === 'STUDENTID'
                    ? 'rgba(255, 0, 0, 0.2)'
                    : 'rgba(0, 0, 255, 0.2)'
                }
                stroke={
                  box.type === 'NAME'
                    ? 'green'
                    : box.type === 'STUDENTID'
                    ? 'red'
                    : 'blue'
                }
                strokeWidth={2}
                draggable={!readOnly} // ปิดการลากถ้า readOnly = true
                onDragEnd={(e) => {
                  if (!readOnly) handleDragEnd(index, e); // ไม่ทำงานถ้า readOnly = true
                }}
                onTransformEnd={() => {
                  if (!readOnly) handleTransformEnd(index); // ไม่ทำงานถ้า readOnly = true
                }}
                onClick={() => {
                  if (!readOnly) setSelectedShapeIndex(index); // ปิดการเลือกถ้า readOnly = true
                }}
              />
              <Text
                x={box.topLeft.x * scaleFactor}
                y={box.topLeft.y * scaleFactor - 20}
                text={
                  box.type === 'QUESTION'
                    ? ` ${box.title} (${box.points} pts)`
                    : `${box.title}`
                }
                fontSize={14}
                fontStyle="bold"
                fill={
                  box.type === 'NAME'
                    ? 'green'
                    : box.type === 'STUDENTID'
                    ? 'red'
                    : 'blue'
                }
              />
            </React.Fragment>
          ))}
          {!readOnly && (
          <Transformer
            ref={transformerRef}
            nodes={
              selectedShapeIndex !== null
                ? [stageRef.current?.findOne(`#box-${selectedShapeIndex}`)]
                : []
            }
            rotateEnabled={false}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]}
          />
        )}
        </Layer>
      </Stage>
    </Container>
  );
};

export default PDFViewer;
