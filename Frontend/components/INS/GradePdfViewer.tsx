"use client";

import dynamic from "next/dynamic";
import "pdfjs-dist/web/pdf_viewer.css";
import * as pdfjsLib from "pdfjs-dist";
import React, { useEffect, useRef, useState } from "react";
import { Button, Container } from "@mantine/core";
import { useFetchSubmissionFile } from "@/hooks/useFetchFile";
import { useSubmissionFileStore } from "@/store/useINS_SubmissionStore";
import { useParams } from "next/navigation";
import {
  AiOutlineZoomIn,
  AiOutlineZoomOut,
  AiOutlineReload,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import { useFetchGradebox } from "@/hooks/BoundingBox/useFetchGradebox";
import { useGradeboxStore } from "@/store/BoundingBox/useGradeboxStore";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

const BoundingBoxOverlay = dynamic(
  () => import("@/components/client/BoundingBoxOverlay"),
  { ssr: false }
);

const GradePdfViewer: React.FC = () => {
  const params = useParams() as Record<string, string | undefined>;
  const course_id = params.course_id!;
  const assignment_id = params.assignment_id!;
  const submission_id = params.submission_id!;
  const { question_id, sub_question_id } = params;

  const { isLoading, error } = useFetchSubmissionFile(
    course_id,
    assignment_id,
    submission_id
  );
  const { submissionFile } = useSubmissionFileStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const renderTaskRef = useRef<any>(null);

  const { data: fetchedBoxes } = useFetchGradebox(assignment_id);
  const storedBoxes = useGradeboxStore((s) => s.bounding_boxes_data);
  const boxes = fetchedBoxes ?? storedBoxes;

  const [finalScale, setFinalScale] = useState(1);

  const applyZoom = (delta: number) => {
    setScale((prev) => Math.max(0.2, prev + delta));
  };

  const renderPDF = async (pageNum: number, baseScale: number) => {
    try {
      const loadingTask = pdfjsLib.getDocument(submissionFile.submission_file_url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      setTotalPages(pdf.numPages);

      // scale ให้พอดีกับความสูงหน้าจอ
      const containerHeight = window.innerHeight;
      const unscaledVP = page.getViewport({ scale: 1 });
      const heightScale = containerHeight / unscaledVP.height;
      const computedScale = baseScale * heightScale;

      setFinalScale(computedScale);

      const viewport = page.getViewport({ scale: computedScale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // ยกเลิกงานก่อนหน้า (ถ้ามี)
      renderTaskRef.current?.cancel();

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF:", err);
        }
      }
    } catch (err) {
      console.error("Error in renderPDF:", err);
    }
  };

  useEffect(() => {
    if (submissionFile.submission_file_url) {
      renderPDF(currentPage, scale);
    }
  }, [submissionFile.submission_file_url, currentPage, scale]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyZoom(e.deltaY < 0 ? 0.1 : -0.1);
    };
    const canvas = canvasRef.current;
    canvas?.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Drag to pan
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

  const handleZoomIn = () => applyZoom(0.2);
  const handleZoomOut = () => applyZoom(-0.2);

  const handleResetZoom = () => {
    setScale(1.2);
    setPan({ x: 0, y: 0 });
  };

  /**
   * ✅ ปรับ logic: Auto-jump ไปหน้าของคำถามจะทำเฉพาะ "ตอนที่เปลี่ยนการเลือกข้อ/คำถาม"
   *    ไม่บังคับให้เด้งกลับเมื่อผู้ใช้กดลูกศรเปลี่ยนหน้าเอง
   *    (เอา currentPage ออกจาก dependency)
   */
  useEffect(() => {
    if (!question_id) return;

    const targetBox = boxes.find(
      (b) =>
        b.question_id === question_id &&
        (b.sub_question_id ?? "") === (sub_question_id ?? "")
    );
    if (!targetBox) return;

    if (currentPage !== targetBox.bounding_box_page) {
      setPan({ x: 0, y: 0 });
      setCurrentPage(targetBox.bounding_box_page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question_id, sub_question_id, boxes]);

  return (
    <Container
      fluid
      p={0}
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        padding: 0,
      }}
    >
      <div
        style={{
          overflow: "hidden",
          height: "100%",
          width: "100%",
          cursor: isDragging.current ? "grabbing" : "grab",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          position: "relative",
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
      </div>

      <BoundingBoxOverlay
        canvasRef={canvasRef}
        assignmentId={assignment_id}
        currentPage={currentPage}
        scale={finalScale}
        pan={pan}
        selectedQuestionId={question_id}
        selectedSubQuestionId={sub_question_id}
      />

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
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

      {/* Previous */}
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

      {/* Next */}
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
