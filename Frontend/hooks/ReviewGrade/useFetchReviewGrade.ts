'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_REVIEW_GRADE_MOCK === '1';
const MOCK_URL = '/mocks/review-grade.json';


export interface ReviewGradeTableRow {
  personal_data_id: string;
  student_name: string;
  email: string;
  sections: string | null;
  score: number | null;
  graded: boolean;
  has_submission: boolean;
  submitted_at: string | null;
}

export interface ReviewGradeBin {
  lower: number;
  upper: number;
  count: number;
  label: string;
}

export interface ReviewGradeStatistics {
  minimum: number | null;
  median: number | null;
  maximum: number | null;
  mean: number | null;
  sd: number | null;
  total_submission: number;
  total_assignment_score: number;
  submission_scores: number[];
  grades_data: ReviewGradeBin[];
  table: ReviewGradeTableRow[];
}

export interface ReviewGradeApiResponse {
  message: string;
  statistics: ReviewGradeStatistics;
}

async function fetchReviewGradeReal({
  courseId,
  assignmentId,
  bin,
}: {
  courseId: string;
  assignmentId: string;
  bin: number;
}): Promise<ReviewGradeApiResponse> {
  const url = `${API_BASE}/instructor/statistics/reviewGrade?course_id=${encodeURIComponent(
    courseId
  )}&assignment_id=${encodeURIComponent(assignmentId)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bin }),
  });
  if (!res.ok) {
    throw new Error(`ReviewGrade fetch failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function fetchReviewGradeMock(): Promise<ReviewGradeApiResponse> {
  const res = await fetch(MOCK_URL);
  if (!res.ok) throw new Error(`Mock not found at ${MOCK_URL}`);
  return res.json();
}


export function useFetchReviewGrade(
  courseId: string | null | undefined,
  assignmentId: string | null | undefined,
  bin: number
) {
  const enabled = USE_MOCK ? true : Boolean(courseId && assignmentId && Number.isFinite(bin));

  return useQuery({
    queryKey: ['statistics', 'reviewGrade', USE_MOCK ? 'mock' : courseId, USE_MOCK ? 'mock' : assignmentId, bin],
    queryFn: () =>
      USE_MOCK
        ? fetchReviewGradeMock()
        : fetchReviewGradeReal({
            courseId: courseId as string,
            assignmentId: assignmentId as string,
            bin,
          }),
    enabled,
  });
}
