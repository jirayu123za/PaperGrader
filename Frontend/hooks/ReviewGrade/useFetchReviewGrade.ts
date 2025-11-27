import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/src/lib/api";
import { useReviewGradeStore, ReviewGradeStatistics } from "@/store/reviewGrade/useReviewGradeStore";

export const useFetchReviewGrade = (course_id: string | null, assignment_id: string | null, bin: number) => {
  const setGradeStatistics = useReviewGradeStore((s) => s.setGradeStatistics);

  return useQuery<ReviewGradeStatistics, Error>({
    queryKey: ["review-grade-statistics", course_id, assignment_id, bin],
    queryFn: async () => {
      const response = await axios.post(`${API_BASE}/instructor/statistics/reviewGrade`,
        { bin },
        {
          params: {
            course_id: course_id,
            assignment_id: assignment_id,
          }
        });

      if (response.status !== 200) {
        throw new Error("Failed to fetch review grade statistics");
      }

      const data: ReviewGradeStatistics = response.data.statistics;
      setGradeStatistics(data || null);
      return data;
    },
    enabled: !!course_id && !!assignment_id && bin !== undefined,
    refetchOnWindowFocus: false,
  });
}
