
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
}

export const usePageMetaStore = create<PageMetaStore>((set, get) => ({
  pageMetas: [],

  setPageMetas: (metas) => set({ pageMetas: metas }),

  getPageMetaByPage: (page) => {
    return get().pageMetas.find((m) => m.pageNumber === page);
  },
}));