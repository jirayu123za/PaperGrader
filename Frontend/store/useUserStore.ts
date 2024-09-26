import create from 'zustand';

// Define the interface for the combined state
interface UserState {
  email: string;
  setEmail: (email: string) => void;
  first_name: string;
  setFirstName: (first_name: string) => void;
  last_name: string;
  setLastName: (last_name: string) => void;
  birth_date: string;
  setBirthDate: (birth_date: string) => void;
  student_id: string;
  setStudentID: (student_id: string) => void;
  selectedUniversity: string;
  setSelectedUniversity: (selectedUniversity: string) => void;
  google_id: string;
  setGoogleId: (id: string) => void;
}

// Create a combined store for all user information
export const useUserStore = create<UserState>((set) => ({
  email: '',
  setEmail: (email) => set(() => ({ email })),
  first_name: '',
  setFirstName: (first_name) => set(() => ({ first_name })),
  last_name: '',
  setLastName: (last_name) => set(() => ({ last_name })),
  birth_date: '',
  setBirthDate: (birth_date) => set(() => ({ birth_date })),
  student_id: '',
  setStudentID: (student_id) => set(() => ({ student_id })),
  selectedUniversity: '',
  setSelectedUniversity: (selectedUniversity) => set(() => ({ selectedUniversity })),
  google_id: '',
  setGoogleId: (id) => set(() => ({ google_id: id })),
}));
