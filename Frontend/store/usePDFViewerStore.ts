import { create } from 'zustand';

interface PDFViewerState {
  scrollOffset: { top: number; left: number };
  setScrollOffset: (offset: { top: number; left: number }) => void;
  selectedShapeIndex: number | null;
  setSelectedShapeIndex: (index: number | null) => void;
}

const usePDFViewerStore = create<PDFViewerState>((set) => ({
  scrollOffset: { top: 0, left: 0 },
  setScrollOffset: (offset) => set({ scrollOffset: offset }),
  selectedShapeIndex: null,
  setSelectedShapeIndex: (index) => set({ selectedShapeIndex: index }),
}));

export default usePDFViewerStore;
