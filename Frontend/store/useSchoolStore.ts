import create from 'zustand';

interface SchoolState {
  schools: any[];
  setSchools: (schools: any[]) => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
    schools: [], 
    setSchools: (schools) => set(() => ({ schools })),
  }));

