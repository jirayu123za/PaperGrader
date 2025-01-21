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

interface BoundingBoxStore {
  boundingBoxes: BoundingBox[];
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
  addBoundingBox: (box: BoundingBox) => void;
  updateBoundingBox: (id: string, updatedBox: Partial<BoundingBox>) => void;
  removeBoundingBox: (id: string) => void;
}

const useBoundingBoxStore = create<BoundingBoxStore>((set) => ({
  boundingBoxes: [],
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
}));

export default useBoundingBoxStore;
