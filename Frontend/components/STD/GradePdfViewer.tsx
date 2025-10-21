"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/src/lib/api";

interface GradePdfViewerProps {
  courseId: string;
  assignmentId: string;
}

const GradePdfViewer: React.FC<GradePdfViewerProps> = ({ courseId, assignmentId }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        // ✅ ดึง URL ของ PDF จาก backend
        const response = await axios.get(`${API_BASE}/student/submission/url`, {
          params: { course_id: courseId, assignment_id: assignmentId },
        });

        // ✅ เก็บลิงก์ PDF ไว้ใน state
        setPdfUrl(response.data.url);
      } catch (error) {
        console.error("❌ Failed to load PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();
  }, [courseId, assignmentId]);

  if (loading) {
    return <p className="text-gray-600">Loading PDF...</p>;
  }

  if (!pdfUrl) {
    return <p className="text-red-500">Failed to load PDF file.</p>;
  }

  return (
    <iframe
      src={pdfUrl}
      width="100%"
      height="800px"
      title="Student Submission PDF"
      className="rounded-b-xl border"
    />
  );
};

export default GradePdfViewer;
