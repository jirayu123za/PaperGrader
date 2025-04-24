"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Container, Paper } from '@mantine/core';
import { useFetchFile } from '../hooks/useFetchFile';
import { useParams } from 'next/navigation';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const KonvaCanvas = dynamic(() => import('./client/KonvaCanvas'), { ssr: false });

const PDFViewer: React.FC = () => {
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfPagesRef = useRef<{ [key: number]: HTMLCanvasElement }>({});
  const { form: fileForm } = useFetchFile({ course_id, assignment_id });
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (pdfContainerRef.current) {
        const rect = pdfContainerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const renderPDF = async () => {
      if (!fileForm.values.pdfUrl || containerWidth === 0 || !innerContainerRef.current) return;
  
      const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
  
      innerContainerRef.current.innerHTML = '';
      pdfPagesRef.current = {};
  
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
  
        const dpiRatio = window.devicePixelRatio || 1;
        const baseScale = containerWidth / unscaledViewport.width;
        const safeScale = baseScale;
        const layoutViewport = page.getViewport({ scale: safeScale });
        const scaledViewport = page.getViewport({ scale: safeScale * dpiRatio });
  
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);
        canvas.style.width = '100%';
        canvas.style.height = `${Math.floor(layoutViewport.height)}px`;
        canvas.style.display = 'block';
  
        const transform = dpiRatio !== 1 ? [dpiRatio, 0, 0, dpiRatio, 0, 0] : undefined;
  
        innerContainerRef.current?.appendChild(canvas);
  
        renderTaskRef.current = page.render({
          canvasContext: context!,
          viewport: layoutViewport,
          transform: transform,
        });
  
        try {
          await renderTaskRef.current.promise;
        } catch (error) {
          console.warn('Render task cancelled or failed:', error);
        }
  
        if (pageNum < numPages) {
          const divider = document.createElement('div');
          divider.style.height = '1px';
          divider.style.background = '#ccc';
          divider.style.width = '100%';
          innerContainerRef.current?.appendChild(divider);
        }
      }
    };
  
    renderPDF();
  }, [fileForm.values.pdfUrl, containerWidth]);

  return (
    <Container
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1 }}
      ref={pdfContainerRef}
      fluid
    >
      <Paper
        ref={innerContainerRef}
        style={{ flexGrow: 1, overflow: 'auto', backgroundColor: '#b0c4de'}}
      >
      </Paper>
      <KonvaCanvas />
    </Container>
  );
};

export default PDFViewer;
