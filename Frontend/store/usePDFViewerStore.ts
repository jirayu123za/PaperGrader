import { create } from 'zustand';

interface PDFViewerState {
  scrollOffset: { top: number; left: number };
  setScrollOffset: (offset: { top: number; left: number }) => void;
  scaleFactor: number;
  setScaleFactor: (scale: number) => void;
  selectedShapeIndex: number | null;
  setSelectedShapeIndex: (index: number | null) => void;
}

const usePDFViewerStore = create<PDFViewerState>((set) => ({
  scrollOffset: { top: 0, left: 0 },
  setScrollOffset: (offset) => set({ scrollOffset: offset }),
  scaleFactor: 1,
  setScaleFactor: (scale) => set({ scaleFactor: scale }),
  selectedShapeIndex: null,
  setSelectedShapeIndex: (index) => set({ selectedShapeIndex: index }),
}));

export default usePDFViewerStore;
