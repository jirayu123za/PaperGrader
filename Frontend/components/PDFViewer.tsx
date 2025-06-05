"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Box, Container, Loader, Paper } from '@mantine/core';
import { useFetchFile } from '../hooks/useFetchFile';
import { useParams } from 'next/navigation';
import { useCreateSidebarStore } from '@/store/process-outline/createSidebarStore';
import { useLeftProcessSidebarStore } from '@/store/process-outline/leftProcessSidebarStore';
import { useFetchTemplate } from '@/hooks/BoundingBox/useFetchBoundingBox';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const KonvaCanvas = dynamic(() => import('./client/KonvaCanvas'), { ssr: false });

const PDFViewer: React.FC = () => {
  const konvaOverlayRef = useRef<HTMLDivElement>(null);
  const pageOffsetsRef = useRef<number[]>([]);
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfPagesRef = useRef<{ [key: number]: HTMLCanvasElement }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { form: fileForm } = useFetchFile({ course_id, assignment_id });
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const isCreateCollapsed = useCreateSidebarStore((state) => state.isCollapsed);
  const isLeftCollapsed = useLeftProcessSidebarStore((state) => state.isCollapsed);
  const { setBoundingBoxesFromAPI, setRubricDataFromAPI } = useBoundingBoxStore();

  const { data: template } = useFetchTemplate(assignment_id);

  useEffect(() => {
    const handleResize = () => {
      if (pdfContainerRef.current) {
        const rect = pdfContainerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCreateCollapsed, isLeftCollapsed]);

  useEffect(() => {
    const renderPDF = async () => {
      if (!fileForm.values.pdfUrl || containerWidth === 0 || !innerContainerRef.current) return;
      setIsLoading(true);

      try {
        const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        innerContainerRef.current.innerHTML = '';
        pdfPagesRef.current = {};

        const pageOffsets: number[] = [];
        let cumulativeHeight = 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const baseScaleW = containerWidth / unscaledViewport.width;
          const baseScaleH = containerHeight / unscaledViewport.height;
          const baseScale = Math.max(baseScaleW, baseScaleH);
          const layoutViewport = page.getViewport({ scale: baseScale });
          const aspectRatio = layoutViewport.height / layoutViewport.width;
          const pageHeight = containerWidth * aspectRatio;

          pageOffsets.push(cumulativeHeight);
          cumulativeHeight += pageHeight;

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = Math.floor(layoutViewport.width);
          canvas.height = Math.floor(layoutViewport.height);
          canvas.style.width = '100%';
          canvas.style.height = `${containerWidth * aspectRatio}px`;
          canvas.style.display = 'block';

          innerContainerRef.current?.appendChild(canvas);

          renderTaskRef.current = page.render({
            canvasContext: context!,
            viewport: layoutViewport,
          });

          try {
            await renderTaskRef.current.promise;
          } catch (error) {
            console.warn('Render task cancelled or failed:', error);
          }
        }

        pageOffsetsRef.current = pageOffsets;

      } finally {
        setIsLoading(false);
      }
    };
    renderPDF();
  }, [fileForm.values.pdfUrl, containerWidth]);

  useEffect(() => {
    if (template && template.bounding_boxes) {
      setBoundingBoxesFromAPI(template.bounding_boxes);
    }
  }, [template]);

  useEffect(() => {
    if (!template) return;

    const rubricQuestions = template.questions?.rubric_data?.questions;
    const apiBoxes = template.bounding_boxes;

    if (Array.isArray(rubricQuestions) && Array.isArray(apiBoxes)) {
      const questionBoxes = apiBoxes.filter(b => b.bounding_box_type === 'question');

      const withBoxIds = rubricQuestions.map((q, i) => ({
        question_id: nanoid(),
        ...q,
        bounding_box_id: questionBoxes[i]?.bounding_box_id ?? '',
      }));

      setRubricDataFromAPI(withBoxIds);
    }
  }, [template]);

  useEffect(() => {
    if (konvaOverlayRef.current && innerContainerRef.current) {
      konvaOverlayRef.current.style.height = `${innerContainerRef.current.scrollHeight}px`;
    }
  }, [isLoading]);

  return (
    <Container
      style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1 }}
      ref={pdfContainerRef}
      fluid
    >
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Loader size="lg" />
        </Box>
      )}
      <Paper style={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        <div ref={innerContainerRef} style={{ position: 'relative', zIndex: 1 }} />
        <div ref={konvaOverlayRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%', height: '100%', pointerEvents: 'auto' }} />
        <KonvaCanvas innerContainerRef={konvaOverlayRef} pageOffsets={pageOffsetsRef} />
      </Paper>
    </Container>
  );
};

export default PDFViewer;
