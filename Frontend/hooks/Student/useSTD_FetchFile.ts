"use client";

import { useEffect } from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import axios from "axios";
import { API_BASE } from "@/src/lib/api";

interface FetchFileParams {
  course_id: string | undefined;
  assignment_id: string | undefined;
}

interface UseFetchFileReturn {
  form: UseFormReturnType<{ pdfUrl: string; loading: boolean }>;
  refetch: () => Promise<void>;
}

// ✅ สำหรับนักศึกษา (STD)
export const useSTDFetchFile = ({
  course_id,
  assignment_id,
}: FetchFileParams): UseFetchFileReturn => {
  const form = useForm<{ pdfUrl: string; loading: boolean }>({
    initialValues: {
      pdfUrl: "",
      loading: true,
    },
  });

  const fetchFileUrl = async () => {
    if (!course_id || !assignment_id) return;

    try {
      form.setFieldValue("loading", true);
      const response = await axios.get(`${API_BASE}/student/template/url`, {
        params: { course_id, assignment_id },
      });

      form.setFieldValue("pdfUrl", response.data.url || "");
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
      alert("Failed to load PDF. Please try again.");
    } finally {
      form.setFieldValue("loading", false);
    }
  };

  useEffect(() => {
    fetchFileUrl();
  }, [course_id, assignment_id]);

  return { form, refetch: fetchFileUrl };
};
