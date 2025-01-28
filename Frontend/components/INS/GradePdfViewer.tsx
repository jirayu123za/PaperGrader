import React, { useEffect, useRef, useState } from 'react';
import { Container } from '@mantine/core';
import { Stage, Layer, Rect, Text } from 'react-konva';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

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
}

interface GradePdfViewerProps {
  fileUrl: string;
  boundingBoxes: BoundingBox[];
  onBoundingBoxesChange?: (updatedBoundingBoxes: BoundingBox[]) => void;
}

const GradePdfViewer: React.FC<GradePdfViewerProps> = ({
  fileUrl,
  boundingBoxes,
  onBoundingBoxesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load and render PDF
  useEffect(() => {
    const renderPDF = async (pageNum: number) => {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);

      setTotalPages(pdf.numPages);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

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

    renderPDF(currentPage);
  }, [fileUrl, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
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
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <Layer>
          {boundingBoxes
            .filter((box) => box.pageNumber === currentPage)
            .map((box, index) => (
              <React.Fragment key={index}>
                <Rect
                  x={box.topLeft.x * 1.5}
                  y={box.topLeft.y * 1.5}
                  width={(box.bottomRight.x - box.topLeft.x) * 1.5}
                  height={(box.bottomRight.y - box.topLeft.y) * 1.5}
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
                />
                <Text
                  x={box.topLeft.x * 1.5}
                  y={box.topLeft.y * 1.5 - 20}
                  text={box.type === 'QUESTION' ? `${box.title} (${box.points} pts)` : box.title}
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
        </Layer>
      </Stage>

      <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10 }}>
        <button disabled={currentPage === 1} onClick={handlePreviousPage}>
          Previous Page
        </button>
        <button disabled={currentPage === totalPages} onClick={handleNextPage}>
          Next Page
        </button>
      </div>
    </Container>
  );
};

export default GradePdfViewer;
