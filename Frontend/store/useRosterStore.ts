import create from 'zustand';

interface UsersList {
    user_id: string;
    full_name: string;
    email: string;
    user_group_name: string;
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
