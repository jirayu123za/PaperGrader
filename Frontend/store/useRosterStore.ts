import create from 'zustand';

// Store user roster data
interface UsersList {
    personal_data_id: string;
    full_name: string;
    email: string;
    role_type: string;
    student_code: string;
    section_name: string;
    submissions_count: number;
}

interface UsersListStore {
    usersList: UsersList[];
    setUsersList: (usersList: UsersList[]) => void;
}

export const useRosterStore = create<UsersListStore>((set) => ({
    usersList: [],
    setUsersList: (usersList: UsersList[]) => set({ usersList }),
}));

// Store section roster data
interface SectionDetails {
    section_id: string;
    section_name: string;
    total_students: number;
}

interface SectionDetailsStore {
    sectionDetails: SectionDetails[];
    setSectionDetails: (sectionDetails: SectionDetails[]) => void;
}

export const useSectionDetailsStore = create<SectionDetailsStore>((set) => ({
    sectionDetails: [],
    setSectionDetails: (sectionDetails: SectionDetails[]) => set({ sectionDetails }),
}));