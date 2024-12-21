import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container } from '@mantine/core';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import usePDFViewerStore from '../store/usePDFViewerStore';

// Worker for PDF.js
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

interface PDFViewerProps {
  fileUrl: string;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, newBox: BoundingBox) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, boundingBoxes, updateBoundingBox }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const { scrollOffset, setScrollOffset, scaleFactor, setScaleFactor, selectedShapeIndex, setSelectedShapeIndex } =
    usePDFViewerStore();

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 1.5; // ปรับขนาด PDF
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
          viewport: viewport,
        }).promise;
      }
    };

    renderPDF();
  }, [fileUrl, setScaleFactor]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollOffset({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft });
  };

  const handleDragEnd = (index: number, e: any) => {
    const box = boundingBoxes[index];
    const width = box.bottomRight.x - box.topLeft.x;
    const height = box.bottomRight.y - box.topLeft.y;

    updateBoundingBox(index, {
      topLeft: {
        x: (e.target.x() + scrollOffset.left) / scaleFactor,
        y: (e.target.y() + scrollOffset.top) / scaleFactor,
      },
      bottomRight: {
        x: ((e.target.x() + scrollOffset.left) / scaleFactor) + width,
        y: ((e.target.y() + scrollOffset.top) / scaleFactor) + height,
      },
    });
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
      onScroll={handleScroll}
    >
      {/* Canvas สำหรับแสดง PDF */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Konva Stage สำหรับ Bounding Boxes */}
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
            <Rect
              key={index}
              id={`box-${index}`}
              x={box.topLeft.x * scaleFactor - scrollOffset.left}
              y={box.topLeft.y * scaleFactor - scrollOffset.top}
              width={(box.bottomRight.x - box.topLeft.x) * scaleFactor}
              height={(box.bottomRight.y - box.topLeft.y) * scaleFactor}
              fill="rgba(0, 0, 255, 0.2)"
              stroke="blue"
              strokeWidth={2}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e)}
              onClick={() => setSelectedShapeIndex(index)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            nodes={
              selectedShapeIndex !== null
                ? [stageRef.current?.findOne(`#box-${selectedShapeIndex}`)]
                : []
            }
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
    </Container>
  );
};

export default PDFViewer;
