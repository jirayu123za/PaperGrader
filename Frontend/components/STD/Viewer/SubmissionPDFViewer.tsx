"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE } from "@/src/lib/api";
import { useParams } from "next/navigation";

export const SubmissionPDFViewer: React.FC= () => {
  const params = useParams();
  const { course_id, assignment_id } = params as {course_id: string; assignment_id: string;};
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await axios.get(`${API_BASE}/student/submission/url`, {
          params: { course_id, assignment_id },
        });

        setPdfUrl(response.data.url);
      } catch (error) {
        console.error("❌ Failed to load PDF:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPDF();
  }, [course_id, assignment_id]);

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
      height={window.innerHeight}
      title="Student Submission PDF"
    />
  );
};
