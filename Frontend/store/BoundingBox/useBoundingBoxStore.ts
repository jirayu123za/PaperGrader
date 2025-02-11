import { create } from 'zustand';

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
      boundingBoxes: [...state.boundingBoxes, box], 
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
        box.bounding_box_id === id ? { ...box, ...updatedBox } : box
      ),
    })),

  updateQuestion: (id, updatedQuestion) =>
    set((state) => ({
      rubricData: {
        ...state.rubricData,
        questions: state.rubricData.questions.map((q) =>
          q.question_id === id ? { ...q, ...updatedQuestion } : q
        ),
      },
    })),

  removeBoundingBox: (boxId) =>
    set((state) => ({
      boundingBoxes: state.boundingBoxes.filter((box) => box.bounding_box_id !== boxId),
    })),

  removeQuestion: (id) =>
    set((state) => ({
      rubricData: {
        ...state.rubricData,
        questions: state.rubricData.questions.filter((q) => q.question_id !== id),
      },
    })),
}));

export default useBoundingBoxStore;
