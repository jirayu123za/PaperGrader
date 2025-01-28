import { create } from 'zustand';

interface BoundingBox {
  id: string;
  assignmentId: string;
  position: string;
  type: string;
  page: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Rubric {
  id: string;
  assignmentId: string;
  rubricData: string; // JSON string
  createdAt?: string;
  updatedAt?: string;
}

interface BoundingBoxStore {
  boundingBoxes: BoundingBox[];
  rubric: Rubric | null;
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
  addBoundingBox: (box: BoundingBox) => void;
  updateBoundingBox: (id: string, updatedBox: Partial<BoundingBox>) => void;
  removeBoundingBox: (id: string) => void;
  setRubric: (rubric: Rubric) => void;
  clearRubric: () => void;
}

const useBoundingBoxStore = create<BoundingBoxStore>((set) => ({
  boundingBoxes: [],
  rubric: null,
  setBoundingBoxes: (boxes) => set(() => ({ boundingBoxes: boxes })),
  addBoundingBox: (box) =>
    set((state) => ({ boundingBoxes: [...state.boundingBoxes, box] })),
  updateBoundingBox: (id, updatedBox) =>
    set((state) => ({
      boundingBoxes: state.boundingBoxes.map((box) =>
        box.id === id ? { ...box, ...updatedBox } : box
      ),
    })),
  removeBoundingBox: (id) =>
    set((state) => ({
      boundingBoxes: state.boundingBoxes.filter((box) => box.id !== id),
    })),
  setRubric: (rubric) => set(() => ({ rubric })),
  clearRubric: () => set(() => ({ rubric: null })),
}));

export default useBoundingBoxStore;
