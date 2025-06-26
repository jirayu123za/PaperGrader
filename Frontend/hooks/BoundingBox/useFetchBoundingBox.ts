import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface BoundingBox {
  bounding_box_id?: string;
  point_x: number;
  point_y: number;
  width: number;
  height: number;
  bounding_box_type: 'question' | 'name' | 'id';
  bounding_box_page: number;
}

export interface ApiBoundingBox {
  bounding_box_point_x: number;
  bounding_box_point_y: number;
  bounding_box_width: number;
  bounding_box_height: number;
  bounding_box_type: 'question' | 'name' | 'id';
  bounding_box_page: number;
}

interface sub_Question {
  subquestion_title: string;
  subquestion_point: number;
}

interface Question {
  question_title: string;
  question_point: number;
  sub_questions?: sub_Question[];
}



export interface CreateBoundingBoxPayload {
  assignment_id: string;
  bounding_boxes: ApiBoundingBox[]; 
  questions_data: Question[];
}

export function mapBoundingBoxesToApiFormat(boundingBoxes: any[]) {
  return boundingBoxes.map((b) => ({
    bounding_box_point_x: b.point_x,
    bounding_box_point_y: b.point_y,
    bounding_box_width: b.width,
    bounding_box_height: b.height,
    bounding_box_type: b.bounding_box_type,
    bounding_box_page: b.bounding_box_page,
  }));
}

type TemplateResponse = {
  bounding_boxes: Array<{
    bounding_box_id: string;
    point_x: number;
  point_y: number;
  width: number;
  height: number;
    bounding_box_type: string;
    bounding_box_page: number;
  }>;
  message: string;
  questions: {
    [x: string]: any;
    rubric_id: string; 
    rubric_data: {
      questions: Array<{
        question_title: string;
        question_point: number;
        sub_questions: Array<{
          sub_question_title: string;
          sub_question_point: number;
        }>;
      }>;
    };
  };
};



// GET bounding boxes & GET questions
export const useFetchTemplate = (assignment_id: string) => {
  return useQuery<TemplateResponse>({
    queryKey: ['template', assignment_id],
    queryFn: async () => {
      const res = await axios.get(`/api/api/instructor/assignment/template?assignment_id=${assignment_id}`);
      return res.data;
    }
  });
};

// CREATE bounding boxes and questions
export function useCreateBoundingBoxes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createBoundingBoxes'],
    mutationFn: async ({ assignment_id, bounding_boxes, questions_data }: CreateBoundingBoxPayload) => {
      const res = await axios.post(`/api/api/instructor/boundingBoxes?assignment_id=${assignment_id}`, {
        bounding_boxes,
        ...(questions_data ? { questions_data } : {}),
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes', variables.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['questions', variables.assignment_id] });
    },
  });
}

// UPDATE bounding box
export function useUpdateBoundingBox(assignment_id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bounding_box_id, update }: { bounding_box_id: string; update: Partial<BoundingBox> }) => {
      const res = await axios.put(`/api/api/instructor/boundingBoxes/${bounding_box_id}`, update);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes', assignment_id] });
    },
  });
}

// DELETE bounding box
export function useDeleteBoundingBox(assignment_id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bounding_box_id: string) => {
      const res = await axios.delete(`/api/instructor/boundingBoxes/${bounding_box_id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes', assignment_id] });
    },
  });
}

// helper to map local rubricData to API structure
export function mapRubricToQuestionsData(rubricData: any) {
  return rubricData.questions.map((q: any) => {
    const hasSub = Array.isArray(q.subquestions) && q.subquestions.length > 0;

    const questionPayload: any = {
      question_title: q.question_title,
      question_point: q.question_point,
    };

    if (hasSub) {
      questionPayload.sub_questions = q.subquestions.map((sub: any) => ({
        sub_question_title: sub.subquestion_title,
        sub_question_point: sub.subquestion_point,
      }));
    }

    return questionPayload;
  });
}