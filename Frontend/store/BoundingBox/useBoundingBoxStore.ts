import { create } from 'zustand';

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

interface BoundingBoxStore {
  boundingBoxes: BoundingBox[];
  rubricData: RubricData;
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
  setRubricData: (rubricData: RubricData) => void;
  addBoundingBox: (box: BoundingBox) => void;
  addQuestion: (question: Question) => void;
  updateBoundingBox: (id: string, updatedBox: Partial<BoundingBox>) => void;
  updateQuestion: (id: string, updatedQuestion: Partial<Question>) => void;
  removeBoundingBox: (id: string) => void;
  removeQuestion: (id: string) => void;
}

const useBoundingBoxStore = create<BoundingBoxStore>((set) => ({
  boundingBoxes: [],
  rubricData: { rubric_id: '', questions: [] },

  setBoundingBoxes: (boxes) => set({ boundingBoxes: boxes }),
  setRubricData: (rubricData) => set({ rubricData }),


  addBoundingBox: (box) =>
    set((state) => ({
      boundingBoxes: [...state.boundingBoxes, {
        bounding_box_id: box.bounding_box_id,
        bounding_box_position: box.bounding_box_position,
        bounding_box_type: box.bounding_box_type,
        bounding_box_page: box.bounding_box_page
      }],
    })),

  addQuestion: (question) =>
    set((state) => ({
      rubricData: {
        ...state.rubricData,
        questions: [...state.rubricData.questions, question],
      },
    })),

  updateBoundingBox: (id, updatedBox) =>
    set((state) => ({
      boundingBoxes: state.boundingBoxes.map((box) =>
        box.bounding_box_id === id
          ? {
            ...box,
            ...updatedBox,
            bounding_box_position: updatedBox.bounding_box_position || box.bounding_box_position,
          }
          : box
      ),
    })),



  updateQuestion: (id, updatedQuestion) =>
    set((state) => {
      const newQuestions = state.rubricData.questions.map((q) =>
        q.question_id === id ? { ...q, ...updatedQuestion } : { ...q }
      );
      return {
        rubricData: {
          ...state.rubricData,
          questions: newQuestions,
        },
      };
    }),

  removeBoundingBox: (bounding_box_id: string) =>
    set((state) => ({
      boundingBoxes: state.boundingBoxes.filter(
        (b) => b.bounding_box_id !== bounding_box_id
      ),
    })),
  removeQuestion: (question_id: string) =>
    set((state) => {
      const questionToRemove = state.rubricData.questions.find(q => q.question_id === question_id);
      const bounding_box_id = questionToRemove?.bounding_box_id;

      return {
        rubricData: {
          ...state.rubricData,
          questions: state.rubricData.questions.filter((q) => q.question_id !== question_id),
        },
        boundingBoxes: bounding_box_id
          ? state.boundingBoxes.filter((b) => b.bounding_box_id !== bounding_box_id)
          : state.boundingBoxes,
      };
    }),

}));

export default useBoundingBoxStore;
