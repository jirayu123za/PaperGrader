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
  bounding_box_id?: string;
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


interface BoundingBoxPayload {
  bounding_box_id?: string;
  bounding_box_point_x: number;
  bounding_box_point_y: number;
  bounding_box_width: number;
  bounding_box_height: number;
  bounding_box_type: string;
  bounding_box_page: number;
}

interface SubQuestionPayload {
  sub_question_id?: string;
  bounding_box_id: string;
  sub_question_point: number;
  sub_question_title: string;
}

interface QuestionPayload {
  question_id?: string;
  bounding_box_id?: string;
  question_point: number;
  question_title: string;
  sub_questions?: SubQuestionPayload[];
}





export function mapBoundingBoxesToApiFormat(
  boundingBoxes: any[],
  includeId = false,
): ApiBoundingBox[] {
  const pageMetas = usePageMetaStore.getState().pageMetas;
  return boundingBoxes
    .map((box) => {
      const meta = pageMetas.find((m) => m.pageNumber === box.bounding_box_page);
      if (!meta) return null;
      const payload: any = {
        bounding_box_point_x: box.point_x,
        bounding_box_point_y: box.point_y,
        bounding_box_width: box.width,
        bounding_box_height: box.height,
        bounding_box_type: box.bounding_box_type,
        bounding_box_page: box.bounding_box_page,
      };
      // ใส่ id ให้เฉพาะไอเท็มที่มาจาก BE (ไม่ใช่ temp-)
      if (includeId && box.bounding_box_id && !box.bounding_box_id.startsWith('temp-')) {
        payload.bounding_box_id = box.bounding_box_id;
      }
      return payload as ApiBoundingBox;
    })
    .filter((b): b is ApiBoundingBox => b !== null);
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


      setRubric(
        data.questions.questions_data.map((q) => ({
          question_id: q.question_id,
          question_title: q.question_title,
          question_point: q.question_point,

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

export function useUpsertBoundingBoxesAndQuestions(assignment_id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['upsertBBAndQ', assignment_id],
    mutationFn: async (payload: {
      bounding_boxes?: BoundingBoxPayload[];
      questions_data?: QuestionPayload[];
    }) => {
      const res = await axios.post(
        `/api/api/instructor/boundingBoxes?assignment_id=${assignment_id}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes', assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['questions', assignment_id] });
      
    },
  });
}


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

// hooks/BoundingBox/useFetchBoundingBox.ts

export function mapRubricToQuestionsData(
  rubricData: any,
  includeId = false,
): QuestionPayload[] {
  return rubricData.questions.map((q: any) => {
    // สร้าง payload เบื้องต้น
    const p: any = {
      question_title: q.question_title,
      question_point: q.question_point,
      // ให้ sub_questions แม้ไม่มี ก็คืนเป็น []
      sub_questions: q.subquestions?.map((sub: any) => {
        const sp: any = {
          sub_question_title: sub.subquestion_title,
          sub_question_point: sub.subquestion_point,
        };
        if (includeId && !sub.subquestion_id.startsWith('temp-')) {
          sp.sub_question_id = sub.subquestion_id;
          sp.bounding_box_id = sub.bounding_box_id;
        }
        return sp;
      }) ?? [],
    };

    // ใส่ question_id + bounding_box_id เฉพาะของเก่า
    if (includeId && !q.question_id.startsWith('temp-')) {
      p.question_id     = q.question_id;
      p.bounding_box_id = q.bounding_box_id;
    }

    return p as QuestionPayload;
  });
}

