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
import { PageMetadata, usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const KonvaCanvas = dynamic(
  () => import('./client/KonvaCanvas').then((mod) => mod.default),
  { ssr: false }
);

const PDFViewer: React.FC = () => {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const konvaOverlayRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const { pageMetas } = usePageMetaStore();
  const setPageMetas = usePageMetaStore((s) => s.setPageMetas);
  const setCurrentPage = usePageMetaStore((s) => s.setCurrentPage);

  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const isCreateCollapsed = useCreateSidebarStore((state) => state.isCollapsed);
  const isLeftCollapsed = useLeftProcessSidebarStore((state) => state.isCollapsed);

  const { form: fileForm } = useFetchFile({ course_id, assignment_id });
  const { data: template } = useFetchTemplate(assignment_id);

  // ปรับขนาดตอน resize sidebar เปลี่ยน state
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

  // โหลดและ render PDF ทุกหน้า พร้อมเก็บ metadata
  useEffect(() => {
    const renderPDF = async () => {
      if (!fileForm.values.pdfUrl || containerWidth === 0 || !innerContainerRef.current) return;
      setIsLoading(true);

      try {
        const loadingTask = pdfjsLib.getDocument(fileForm.values.pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        // ล้าง container เก่าก่อน
        innerContainerRef.current.innerHTML = '';
        const metas: PageMetadata[] = [];
        let cumulativeHeight = 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          // คำนวณ scale ให้เต็มความกว้าง container
          const unscaled = page.getViewport({ scale: 1 });
          const scale = containerWidth / unscaled.width;
          const viewport = page.getViewport({ scale });

          metas.push({
            pageNumber: pageNum,
            scale,
            width: viewport.width,
            height: viewport.height,
            offsetY: cumulativeHeight,
          });
          cumulativeHeight += viewport.height;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = '100%';
          canvas.style.height = `${viewport.height}px`;
          canvas.style.display = 'block';

          innerContainerRef.current.appendChild(canvas);
          const renderTask = page.render({ canvasContext: ctx, viewport });
          try {
            await renderTask.promise;
          } catch (e) {
            console.warn('PDF render cancelled:', e);
          }
        }

        // เซ็ต metadata ลง store
        setPageMetas(metas);
      } finally {
        setIsLoading(false);
      }
    };

    renderPDF();
  }, [fileForm.values.pdfUrl, containerWidth]);

  // ปรับขนาด overlay ให้ครอบ inner container
  useEffect(() => {
    if (konvaOverlayRef.current && innerContainerRef.current) {
      konvaOverlayRef.current.style.height = `${innerContainerRef.current.scrollHeight}px`;
      konvaOverlayRef.current.style.width = `${innerContainerRef.current.scrollWidth}px`;
    }
  }, [isLoading]);

  // Scroll listener ผูกกับ <Paper> เพื่ออัปเดต currentPage
  useEffect(() => {
    const container = paperRef.current;
    if (!container) return;

    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const current = pageMetas.find(
        (m) => scrollTop >= m.offsetY && scrollTop < m.offsetY + m.height
      );
      if (current) setCurrentPage(current.pageNumber);
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [pageMetas]);

  return (
    <Container
      ref={pdfContainerRef}
      fluid
      style={{
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Loader size="lg" />
        </Box>
      )}

      <Paper
        ref={paperRef}
        style={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}
      >
        <div
          ref={innerContainerRef}
          style={{ position: 'relative', zIndex: 1 }}
        />

        <div
          ref={konvaOverlayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: 'auto',
          }}
        />

        <KonvaCanvas innerContainerRef={konvaOverlayRef} />
      </Paper>
    </Container>
  );
};

export default PDFViewer;
