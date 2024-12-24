import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container } from '@mantine/core';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import usePDFViewerStore from '../store/usePDFViewerStore';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
}

interface PDFViewerProps {
  fileUrl: string;
  assignmentId: string;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, newBox: BoundingBox) => void;
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  assignmentId,
  boundingBoxes,
  updateBoundingBox,
  setBoundingBoxes,
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
          setBoundingBoxes(parsedBoxes);
        } else {
          console.error('Invalid bounding box data format.');
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, [assignmentId, setBoundingBoxes]);

  const handleDragEnd = (index: number, e: any) => {
    const box = boundingBoxes[index];
    const width = box.bottomRight.x - box.topLeft.x;
    const height = box.bottomRight.y - box.topLeft.y;

    const newTopLeftX = e.target.x() / scaleFactor;
    const newTopLeftY = e.target.y() / scaleFactor;

    updateBoundingBox(index, {
      ...box,
      topLeft: {
        x: newTopLeftX,
        y: newTopLeftY,
      },
      bottomRight: {
        x: newTopLeftX + width,
        y: newTopLeftY + height,
      },
    });
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

    updateBoundingBox(index, updatedBox);
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
                draggable
                onDragEnd={(e) => handleDragEnd(index, e)}
                onClick={() => setSelectedShapeIndex(index)}
                onTransformEnd={() => handleTransformEnd(index)}
              />
              <Text
                x={box.topLeft.x * scaleFactor}
                y={box.topLeft.y * scaleFactor - 20}
                text={
                  box.type === 'QUESTION'
                    ? `Q${index + 1}: ${box.title} (${box.points} pts)`
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
          <Transformer
            ref={transformerRef}
            nodes={
              selectedShapeIndex !== null
                ? [stageRef.current?.findOne(`#box-${selectedShapeIndex}`)]
                : []
            }
            rotateEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right','middle-left','middle-right','top-center','bottom-center']}
          />
        </Layer>
      </Stage>
    </Container>
  );
};

export default PDFViewer;
