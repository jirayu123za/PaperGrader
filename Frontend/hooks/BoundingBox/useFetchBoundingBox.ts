import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useBoundingBoxStore from '../../store/BoundingBox/useBoundingBoxStore';

const API_BASE_URL = '/api/api/instructor';

interface BoundingBox {
  bounding_box_id: string;
  bounding_box_position: string;
  bounding_box_type: string;
  bounding_box_page: number;
}

interface SubQuestion {
  bounding_box_id: string;
  subquestion_id: string;
  subquestion_point: number;
  subquestion_title: string;
}

interface Question {
  question_id: string;
  question_point: number;
  question_title: string;
  bounding_box_id?: string;
  subquestions?: SubQuestion[];
}

interface RubricData {
  rubric_id: string;
  questions: Question[];
}

interface BoundingBoxAndQuestionsResponse {
  boundingBoxes: BoundingBox[];
  rubricData: RubricData;
}

//  ดึงข้อมูล BoundingBoxes + Questions (JSONB)
export const useFetchBoundingBoxesAndQuestions = (assignmentId: string) => {
  const { setBoundingBoxes, setRubricData } = useBoundingBoxStore();

  return useQuery({
    queryKey: ['boundingBoxesAndQuestions', assignmentId],
    queryFn: async (): Promise<BoundingBoxAndQuestionsResponse> => {
      const [boundingBoxesRes, questionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/boundingBoxes?assignment_id=${assignmentId}`),
        axios.get(`${API_BASE_URL}/questions?assignment_id=${assignmentId}`),
      ]);

      const boundingBoxes = boundingBoxesRes.data.bounding_boxes || []; // ค่าเริ่มต้นเป็น []
      const rubricData = questionsRes.data.questions.rubric_data || { rubric_id: '', questions: [] };

      setBoundingBoxes(boundingBoxes);
      setRubricData(rubricData);

      return { boundingBoxes, rubricData };
    },
    enabled: Boolean(assignmentId),
  });
};

// 📌 Mutation: เพิ่ม BoundingBox + Question (PUT)
export const useAddBoundingBoxAndQuestion = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { addBoundingBox, addQuestion } = useBoundingBoxStore();

  return useMutation<
    { boundingBox: BoundingBox; question: Question },
    Error,
    { boundingBox: Omit<BoundingBox, 'bounding_box_id'>; question: Omit<Question, 'question_id'> }
  >({
    mutationFn: async (data) => {
      const response = await axios.put(`${API_BASE_URL}/boundingBoxes?assignment_id=${assignmentId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      addBoundingBox(data.boundingBox);
      addQuestion(data.question);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndQuestions', assignmentId] });
    },
  });
};

// 📌 Mutation: อัปเดต BoundingBox + Question (PUT)
export const useUpdateBoundingBoxAndQuestion = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { updateBoundingBox, updateQuestion } = useBoundingBoxStore();

  return useMutation<
    { boundingBox: BoundingBox; question: Question },
    Error,
    { boundingBox: Partial<BoundingBox>; question: Partial<Question> }
  >({
    mutationFn: async (data) => {
      const response = await axios.put(`${API_BASE_URL}/boundingBoxes?assignment_id=${assignmentId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateBoundingBox(data.boundingBox.bounding_box_id, data.boundingBox);
      updateQuestion(data.question.question_id, data.question);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndQuestions', assignmentId] });
    },
  });
};

// 📌 Mutation: ลบ BoundingBox + Question (DELETE)
export const useRemoveBoundingBoxAndQuestion = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { removeBoundingBox, removeQuestion } = useBoundingBoxStore();

  return useMutation<
    { boundingBoxId: string; questionId: string },
    Error,
    { boundingBoxId: string; questionId: string }
  >({
    mutationFn: async (data) => {
      await axios.delete(`${API_BASE_URL}/boundingBoxes?assignment_id=${assignmentId}`, { data });
      return data;
    },
    onSuccess: (data) => {
      removeBoundingBox(data.boundingBoxId);
      removeQuestion(data.questionId);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndQuestions', assignmentId] });
    },
  });
};
