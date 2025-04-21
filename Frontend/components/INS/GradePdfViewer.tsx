"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Flex } from '@mantine/core';
import { Stage, Layer, Rect, Text } from 'react-konva';
import * as pdfjsLib from 'pdfjs-dist';
// import 'pdfjs-dist/web/pdf_viewer.css';
import { useFetchSubmissionFile } from '../../hooks/useFetchFile';
import { useSubmissionFileStore } from '../../store/useINS_SubmissionStore';
import { useRouter , useParams } from 'next/navigation';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// interface BoundingBox {
//   id: number;
//   questionId: string;
//   topLeft: { x: number; y: number };
//   bottomRight: { x: number; y: number };
//   pageNumber: number;
//   title: string;
//   points: number;
//   type: 'NAME' | 'STUDENTID' | 'QUESTION';
// }

// interface GradePdfViewerProps {
//   fileUrl: string;
//   boundingBoxes: BoundingBox[];
//   onBoundingBoxesChange?: (updatedBoundingBoxes: BoundingBox[]) => void;
// }

// const GradePdfViewer: React.FC<GradePdfViewerProps> = ({ boundingBoxes, onBoundingBoxesChange }) => {
const GradePdfViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const renderTaskRef = useRef<any>(null);

  const router = useRouter();
  const { assignment_id, course_id, submission_id } = router.query;
  const { isLoading, error } = useFetchSubmissionFile(course_id as string, assignment_id as string, submission_id as string);
  const { submissionFile } = useSubmissionFileStore();

  useEffect(() => {
    const renderPDF = async (pageNum: number) => {
      try {
        const response = await fetch(submissionFile.submission_file_url);
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNum);

        setTotalPages(pdf.numPages);

        const scale = 1;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          setCanvasSize({ width: viewport.width, height: viewport.height });

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          renderTaskRef.current = page.render({
            canvasContext: context!,
            viewport,
          });

          await renderTaskRef.current.promise;
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };

    if (submissionFile.submission_file_url) {
      renderPDF(currentPage);
    }

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [currentPage, submissionFile.submission_file_url]);

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
      // style={{
      //   position: 'relative',
      //   width: '100%',
      //   height: '100vh',
      //   overflow: 'auto',
      //   border: '1px solid #ccc',
      // }}
    >
      <canvas 
        ref={canvasRef}
        className='border-2 border-gray-400 shadow-xs'
      />

      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <Layer>
          {/* {boundingBoxes
            .filter((box) => box.pageNumber === currentPage)
            .map((box, index) => (
              <React.Fragment key={index}> */}
                {/* <Rect
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
                /> */}
              {/* </React.Fragment>
            ))} */}
        </Layer>
      </Stage>

      <Flex justify="space-between" align="center" mt="lg">
        <Button
          variant="transparent"
          disabled={currentPage === 1 || isLoading} 
          onClick={handlePreviousPage}
        >
          Previous Page
        </Button>
        <Button 
          variant="transparent"
          disabled={currentPage === totalPages || isLoading} 
          onClick={handleNextPage}
        >
          Next Page
        </Button>
      </Flex>
    </Container>
  );
};

export default GradePdfViewer;
