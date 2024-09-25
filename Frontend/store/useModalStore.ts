import create from 'zustand';

interface ModalStore {
  isSignInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isSignInOpen: false,
  openSignIn: () => set({ isSignInOpen: true }),
  closeSignIn: () => set({ isSignInOpen: false }),
}));
