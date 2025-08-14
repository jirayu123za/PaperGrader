import { create } from 'zustand';

interface BoundingBox {
  bounding_box_id: string;
  point_x: number;
  point_y: number;
  width: number;
  height: number;
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
  setBoundingBoxesFromAPI: (data: BoundingBox[]) => void;
  setRubricDataFromAPI: (questions: Question[]) => void;
}

const useBoundingBoxStore = create<BoundingBoxStore>((set) => ({
  boundingBoxes: [],
  rubricData: { rubric_id: '', questions: [] },

  setBoundingBoxes: (boxes) => set({ boundingBoxes: boxes }),
  setRubricData: (rubricData) => set({ rubricData }),


  addBoundingBox: (box) => set((state) => {
    return {
      boundingBoxes: [
        ...state.boundingBoxes,
        {
          bounding_box_id: box.bounding_box_id,
          point_x: box.point_x,
          point_y: box.point_y,
          width: box.width,
          height: box.height,
          bounding_box_type: box.bounding_box_type,
          bounding_box_page: box.bounding_box_page,
        },
      ],
    };
  }),

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
            point_x: updatedBox.point_x !== undefined ? updatedBox.point_x : box.point_x,
            point_y: updatedBox.point_y !== undefined ? updatedBox.point_y : box.point_y,
            width: updatedBox.width !== undefined ? updatedBox.width : box.width,
            height: updatedBox.height !== undefined ? updatedBox.height : box.height,
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



  removeQuestion: (questionId: string) =>
    set((state) => {
      const q = state.rubricData.questions.find((x) => x.question_id === questionId);
      const idsToRemove = new Set<string>();

      if (q?.bounding_box_id) idsToRemove.add(q.bounding_box_id);
      q?.subquestions?.forEach((s) => {
        if (s.bounding_box_id) idsToRemove.add(s.bounding_box_id);
      });

      return {
        rubricData: {
          ...state.rubricData,
          questions: state.rubricData.questions.filter((x) => x.question_id !== questionId),
        },

        boundingBoxes: state.boundingBoxes.filter(
          (b) => !idsToRemove.has(b.bounding_box_id)
        ),
      };
    }),
  setBoundingBoxesFromAPI: (data) => set({ boundingBoxes: data }),
  removeSubquestion: (questionId: string, subIndex: number) =>
    set((state) => {
      const qs = state.rubricData.questions.map((q) => {
        if (q.question_id !== questionId) return q;
        const target = q.subquestions?.[subIndex];
        const toRemove = target?.bounding_box_id;

        const nextSubs = (q.subquestions ?? []).filter((_, i) => i !== subIndex);

        return {
          ...q,
          subquestions: nextSubs,
        };
      });

      // เก็บ id ที่ถูกลบจาก subquestion
      const removedId =
        state.rubricData.questions
          .find((q) => q.question_id === questionId)
          ?.subquestions?.[subIndex]?.bounding_box_id;

      const nextBoxes = removedId
        ? state.boundingBoxes.filter((b) => b.bounding_box_id !== removedId)
        : state.boundingBoxes;

      return {
        rubricData: { ...state.rubricData, questions: qs },
        boundingBoxes: nextBoxes,
      };
    }),

  setRubricDataFromAPI: (questions) =>
    set({
      rubricData: {
        rubric_id: '', // หรือจาก API จริง
        questions: questions.map((q) => ({
          ...q,
          subquestions: q.subquestions ?? [],
        })),
      },
    }),

}));


export default useBoundingBoxStore;
