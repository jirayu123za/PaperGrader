import create from 'zustand';
import { BoundingBox } from '@/hooks/BoundingBox/useFetchGradebox';

interface GradeboxState {
  bounding_boxes_data: BoundingBox[];
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
  clearBoundingBoxes: () => void;
}

/**
 * Zustand store for grade bounding boxes
 */
export const useGradeboxStore = create<GradeboxState>((set) => ({
  bounding_boxes_data: [],
  setBoundingBoxes: (boxes) => set({ bounding_boxes_data: boxes }),
  clearBoundingBoxes: () => set({ bounding_boxes_data: [] }),
}));
