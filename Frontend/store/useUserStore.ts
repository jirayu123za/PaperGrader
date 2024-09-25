import create from 'zustand';

interface UserState {
    email: { user_id: string, email: string }[]; // เก็บเป็น array ของ object ที่มี user_id และ email
    setEmails: (email: { user_id: string, email: string }[]) => void;
  }
  
  export const useEmailStore = create<UserState>((set) => ({
    email: [], // เริ่มต้นเป็น array ของ object ที่เก็บข้อมูล
    setEmails: (email) => set(() => ({ email })),
  }));
  