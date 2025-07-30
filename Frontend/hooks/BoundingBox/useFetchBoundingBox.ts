import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';



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



export function mapBoundingBoxesToApiFormat(boundingBoxes: any[]): ApiBoundingBox[] {
  const pageMetas = usePageMetaStore.getState().pageMetas;

  return boundingBoxes.map((box) => {
    const meta = pageMetas.find((m) => m.pageNumber === box.bounding_box_page);
    if (!meta) return null;

    return {
      bounding_box_point_x: box.point_x ,
      bounding_box_point_y: box.point_y ,
      bounding_box_width: box.width ,
      bounding_box_height: box.height ,
      bounding_box_type: box.bounding_box_type,
      bounding_box_page: box.bounding_box_page,
    };
  }).filter((b): b is ApiBoundingBox => b !== null);
}


export type TemplateResponse = {
  bounding_boxes: Array<{
    bounding_box_id: string;
    bounding_box_type: string;
    bounding_box_page: number;
    bounding_box_point_x: number;
    bounding_box_point_y: number;
    bounding_box_width: number;
    bounding_box_height: number;
  }>;
  message: string;
  questions: {
    rubric_id: string;
    questions_data: Array<{
      bounding_box_id?: string;
      question_id: string;
      question_point: number;
      question_title: string;
      sub_questions?: Array<{
        bounding_box_id: string;
        sub_question_id: string;
        sub_question_point: number;
        sub_question_title: string;
      }>;
    }>;
  };
};



// GET bounding boxes & GET questions
export const useFetchTemplate = (assignment_id: string) => {
  const setBoxes = useBoundingBoxStore((s) => s.setBoundingBoxesFromAPI);
  const setRubric = useBoundingBoxStore((s) => s.setRubricDataFromAPI);
  const pageMetas = usePageMetaStore((s) => s.pageMetas);

  return useQuery<TemplateResponse, Error>({
    queryKey: ['template', assignment_id],
    queryFn: async () => {
      const response = await axios.get<TemplateResponse>(
        '/api/api/instructor/assignment/template',
        { params: { assignment_id } }
      );

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data;

      // แปลงและเซฟ bounding boxes ลง store
      setBoxes(
        data.bounding_boxes.map((b) => ({
          bounding_box_id: b.bounding_box_id,
          point_x: b.bounding_box_point_x,
          point_y: b.bounding_box_point_y,
          width: b.bounding_box_width,
          height: b.bounding_box_height,
          bounding_box_type: b.bounding_box_type,
          bounding_box_page: b.bounding_box_page,
        }))
      );

      // แปลงและเซฟ rubric data ลง store
      setRubric(
        data.questions.questions_data.map((q) => ({
          question_id: q.question_id,
          question_title: q.question_title,
          question_point: q.question_point,
          // ถ้าไม่มี sub_questions ก็เซฟเป็น array ว่าง
          subquestions: q.sub_questions?.map((sub) => ({
            subquestion_id: sub.sub_question_id,
            subquestion_title: sub.sub_question_title,
            subquestion_point: sub.sub_question_point,
            bounding_box_id: sub.bounding_box_id,
          })) || [],
        }))
      );

      return data;
    },
    enabled: !!assignment_id && pageMetas.length > 0,
    refetchOnWindowFocus: false,
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