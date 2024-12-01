import create from 'zustand';

interface ColumnData {
  first_name: string[];
  last_name: string[];
  email: string[];
  student_code: string[];
  section: string[];
  role_type: string;
}

export interface ColumnSelectStore {
  importData: ColumnData[];
  selectedColumns: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    section: string;
  };
  role: string;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    section?: string;
    studentId?: string;
  };
  setImportData: (data: ColumnData) => void;
  clearImportData: () => void;
  setSelectedColumn: (field: keyof ColumnSelectStore['selectedColumns'], value: string) => void;
  setRole: (role: string) => void;
  setErrors: (errors: Partial<ColumnSelectStore['errors']>) => void;
  clearErrors: () => void;
}

const useColumnSelectStore = create<ColumnSelectStore>((set) => ({
  importData: [],
  selectedColumns: {
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    section: '',
  },
  role: 'STUDENT',
  errors: {},
  setImportData: (data) =>
    set((state) => ({
      importData: [...state.importData, data],
    })),
  clearImportData: () => set({ importData: [] }),
  setSelectedColumn: (field, value) =>
    set((state) => {
      const newErrors = { ...state.errors };
      if (value) {
        delete newErrors[field];
      }
      return {
        selectedColumns: {
          ...state.selectedColumns,
          [field]: value,
        },
        errors: newErrors,
      };
    }),
  setRole: (role) => set({ role }),
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}));

export default useColumnSelectStore;
