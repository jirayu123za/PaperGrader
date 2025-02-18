import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useBoundingBoxStore from '../../store/BoundingBox/useBoundingBoxStore';

const API_BASE_URL = '/api/api/instructor';

interface BoundingBox {
  bounding_box_id: string;
  bounding_box_position: string;
  bounding_box_type: string;
  bounding_box_page: number;
  bounding_box_image: string;
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

      const boundingBoxes = boundingBoxesRes.data.bounding_boxes || [];
      const rubricData = questionsRes.data.questions?.rubric_data || { rubric_id: `temp-${Date.now()}`, questions: [] };



      if (!rubricData.rubric_id) {
        rubricData.rubric_id = `temp-${Date.now()}`; 
      }

      setBoundingBoxes(boundingBoxes);
      setRubricData(rubricData);

      return { boundingBoxes, rubricData };
    },
    enabled: Boolean(assignmentId),
  });
};

// 📌 Mutation: เพิ่ม BoundingBox + Question (POST)
export const useAddBoundingBoxAndQuestion = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { addBoundingBox, addQuestion } = useBoundingBoxStore();

  return useMutation<
    void,
    Error,
    {
      boundingBoxes: Omit<BoundingBox, "bounding_box_id">[];
      questionsData?: {
        questions: Omit<Question, "question_id">[]
      }
    }
  >({
    mutationFn: async (data) => {
      console.log("📤 กำลังส่งข้อมูลไปยัง API...");
      console.log("🟢 assignment_id ที่ถูกส่งไป:", assignmentId);

      const payload = {
        bounding_boxes: data.boundingBoxes.map(box => ({
          bounding_box_position: box.bounding_box_position,
          bounding_box_type: box.bounding_box_type,
          bounding_box_page: box.bounding_box_page,
          bounding_box_image: box.bounding_box_image || "", 
        })),
        questions_data: data.questionsData && data.questionsData.questions.length > 0
          ? {
            questions: data.questionsData.questions.map(question => ({
              question_point: question.question_point,
              question_title: question.question_title,
            }))
          }
          : undefined, 
      };

      console.log("📦 Payload ที่จะส่งไป:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_BASE_URL}/boundingBoxes?assignment_id=${assignmentId}`, payload);

      console.log("✅ Response จาก API:", response.data);
    },
    onSuccess: () => {
      console.log(" Success! Data ถูกบันทึก");
      queryClient.invalidateQueries({ queryKey: ["boundingBoxesAndQuestions", assignmentId] });
      
    },
    onError: (error) => {
      console.error(" Error ในการบันทึกข้อมูล:", error);
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
