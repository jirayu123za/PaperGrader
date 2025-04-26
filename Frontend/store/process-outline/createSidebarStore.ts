import { create } from 'zustand';

type SidebarState = {
    isCollapsed: boolean;
    toggle: () => void;
};

export const useCreateSidebarStore = create<SidebarState>((set) => ({
    isCollapsed: false,
    toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));