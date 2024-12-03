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
    sectionUsersList: UsersList[];
    setSectionUsersList: (usersList: UsersList[]) => void;

    searchTerm: string;
    setSearchTerm: (term: string) => void;
    roleFilter: string | null;
    setRoleFilter: (role: string | null) => void;
}

export const useRosterStore = create<UsersListStore>((set) => ({
    usersList: [],
    setUsersList: (usersList: UsersList[]) => set({ usersList }),
    sectionUsersList: [],
    setSectionUsersList: (usersList: UsersList[]) => set({ sectionUsersList: usersList }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
    roleFilter: null,
    setRoleFilter: (role) => set({ roleFilter: role }),
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
