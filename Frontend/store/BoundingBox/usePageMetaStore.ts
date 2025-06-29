
import { create } from 'zustand';

export interface PageMetadata {
  pageNumber: number;
  scale: number;
  width: number;
  height: number;
  offsetY: number;
}

interface PageMetaStore {
  pageMetas: PageMetadata[];
  setPageMetas: (metas: PageMetadata[]) => void;
  getPageMetaByPage: (page: number) => PageMetadata | undefined;

  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const usePageMetaStore = create<PageMetaStore>((set, get) => ({
  pageMetas: [],
  currentPage: 1,
  setPageMetas: (metas) => set({ pageMetas: metas }),
  setCurrentPage: (page) => set({ currentPage: page }),
  getPageMetaByPage: (page) => get().pageMetas.find(m => m.pageNumber === page),
}));