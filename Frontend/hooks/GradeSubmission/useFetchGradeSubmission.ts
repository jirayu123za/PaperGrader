import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from '@/src/lib/api';
import { useGradeSubmissionStore } from "@/store/GradeSubmission/useGradeSubmissionStore";
import { UUID } from "crypto";

interface fetchSubmissionDetailsParams {
    course_id: string | null;
    assignment_id: string | null;
    submission_id: string | null;
}

interface RubricDetail {
    rubric_detail_id: UUID;
    has_selected: boolean;
    rubric_point: number;
    rubric_description: string;
}

interface Rubrics {
    rubric_id: UUID;
    has_floor: boolean;
    has_ceiling: boolean;
    rubric_setting: string;
    rubric_details: RubricDetail[];
}

interface SubQuestion {
    sub_question_id: UUID;
    sub_question_title: string;
    sub_question_point: number;
    bounding_box_id?: UUID | null;
    rubrics?: Rubrics;
}

interface Question {
    question_id: UUID;
    question_title: string;
    question_point: number;
    bounding_box_id?: UUID | null;
    rubrics?: Rubrics;
    sub_questions?: SubQuestion[];
}

interface header_details {
    full_name: string;
    nick_name: string;
    section: string;
}

interface assignment_details {
    assignment_name: string;
}

interface summary {
    grade_status: boolean;
    total_assignment_point: number;
    total_submission_point: number;
}

interface SubmissionDetails {
    questions_details: Question[];
    header_details: header_details;
    assignment_details: assignment_details;
    summary: summary;
}

export const useFetchSubmissionDetails = ({ course_id, assignment_id, submission_id }: fetchSubmissionDetailsParams) => {
    const setSubmissionDetails = useGradeSubmissionStore((state) => state.setSubmissionDetails);

    return useQuery<SubmissionDetails, Error>({
        queryKey: ["submission_details", course_id, assignment_id, submission_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/submission/details`, {
                params: {
                    course_id: course_id,
                    assignment_id: assignment_id,
                    submission_id: submission_id,
                },
            });

            if (response.status !== 200) {
                throw new Error("Failed to fetch submission details");
            }

            const data = response.data.submission_details;
            setSubmissionDetails(data || null);
            return data || null;
        },
        enabled: !!course_id && !!assignment_id && !!submission_id,
        refetchOnWindowFocus: false,
    });
}