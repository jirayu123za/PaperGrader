"use client";

import { useSTD_SubmissionFileStore } from "@/store/Student/useSTD_SubmissionFileStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "@/src/lib/api";

interface SubmissionFileResponse {
  message: string;
  submission_file_url: string;
}

// ✅ สำหรับนักศึกษา (STD)
export const useSTDFetchSubmissionFile = (
  course_id: string,
  assignment_id: string
) => {
  const setSubmissionFile = useSTD_SubmissionFileStore(
    (state) => state.setSubmissionFile
  );

  return useQuery<SubmissionFileResponse>({
    queryKey: ["std_submission_file_url", course_id, assignment_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student/submission/fileURL`, {
        params: { course_id, assignment_id },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch submission file");
      }

      if (response.data.submission_file_url) {
        setSubmissionFile({
          submission_file_url: response.data.submission_file_url,
        });
      }

      return response.data;
    },
    enabled: !!course_id && !!assignment_id,
  });
};
