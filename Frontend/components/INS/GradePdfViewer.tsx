"use client";

import dynamic from "next/dynamic";
import "pdfjs-dist/web/pdf_viewer.css";
import * as pdfjsLib from "pdfjs-dist";
import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Loader } from "@mantine/core";
import { useFetchSubmissionFile } from "@/hooks/useFetchFile";
import { useSubmissionFileStore } from "@/store/useINS_SubmissionStore";
import { useParams } from "next/navigation";
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineReload, AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";



(pdfjsLib as any).GlobalWorkerOptions.workerSrc ="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

const BoundingBoxOverlay = dynamic(
  () => import("@/components/client/BoundingBoxOverlay"),
  { ssr: false }
);


const GradePdfViewer: React.FC = () => {
  const params = useParams() as Record<string, string>;
  const assignment_id = params.assignment_id;
  const course_id = params.course_id;
  const submission_id = params.submission_id;
  const { isLoading, error } = useFetchSubmissionFile(course_id, assignment_id, submission_id);
  const { submissionFile } = useSubmissionFileStore();
  // PDF func under here:
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const renderTaskRef = useRef<any>(null);

  const renderPDF = async (pageNum: number, scaleValue: number) => {
    try {
      const loadingTask = pdfjsLib.getDocument(submissionFile.submission_file_url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);

      setTotalPages(pdf.numPages);

      const containerHeight = window.innerHeight;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scaleForHeight = containerHeight / unscaledViewport.height;
      const finalScale = scaleValue * scaleForHeight;

      const viewport = page.getViewport({ scale: finalScale });

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

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
      console.error("Error rendering PDF:", error);
    }
  };


  useEffect(() => {
    renderPDF(currentPage, scale);
  }, [currentPage, scale]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setScale((prev) => prev + 0.1);
      } else {
        setScale((prev) => Math.max(0.2, prev - 0.1));
      }
    };
    const canvas = canvasRef.current;
    canvas?.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas?.removeEventListener("wheel", handleWheel);
    };
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleNextPage = () => {
    setPan({ x: 0, y: 0 });
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    setPan({ x: 0, y: 0 });
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => prev + 0.2);
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.2, prev - 0.2));
  };

  const handleResetZoom = () => {
    setScale(1.2);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Container
      style={{
        position: "relative",
        height: "95vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          height: "100%",
          cursor: isDragging.current ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging.current ? "none" : "transform 0.1s",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "0px",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          }}
        />
        <BoundingBoxOverlay
          canvasRef={canvasRef}
          assignmentId={assignment_id}
          currentPage={currentPage}
          scale={scale}
          pan={pan}
        />
      </div>

      {/* ปุ่ม Zoom */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex",
          gap: "0.5rem",
          background: "rgba(255,255,255,0.85)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      >
        <Button onClick={handleZoomOut} variant="light" size="xs">
          <AiOutlineZoomOut />
        </Button>
        <Button onClick={handleResetZoom} variant="light" size="xs">
          <AiOutlineReload />
        </Button>
        <Button onClick={handleZoomIn} variant="light" size="xs">
          <AiOutlineZoomIn />
        </Button>
      </div>

      {/* ปุ่ม Previous */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
        }}
      >
        <Button
          onClick={handlePreviousPage}
          variant="light"
          size="xs"
          disabled={currentPage === 1}
        >
          <AiOutlineArrowLeft />
        </Button>
      </div>

      {/* ปุ่ม Next */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
        }}
      >
        <Button
          onClick={handleNextPage}
          variant="light"
          size="xs"
          disabled={currentPage === totalPages}
        >
          <AiOutlineArrowRight />
        </Button>
      </div>

      {/* Page Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.85)",
          padding: "0.2rem 0.5rem",
          borderRadius: "0.3rem",
          fontSize: "0.75rem",
        }}
      >
        Page {currentPage}/{totalPages}
      </div>
    </Container>
  );
};

export default GradePdfViewer;
