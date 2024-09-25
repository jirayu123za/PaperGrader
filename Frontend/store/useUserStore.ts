import create from 'zustand';

// Define the interface for email state
interface EmailState {
  email: string;
  setEmail: (email: string) => void;
}

// Define the interface for first name state
interface FirstNameState {
  firstName: string;
  setFirstName: (firstName: string) => void;
}

// Define the interface for last name state
interface LastNameState {
  lastName: string;
  setLastName: (lastName: string) => void;
}

// Create the email store
export const useEmailStore = create<EmailState>((set) => ({
  email: '',
  setEmail: (email) => set(() => ({ email })),
}));

// Create the first name store
export const useFirstNameStore = create<FirstNameState>((set) => ({
  firstName: '',
  setFirstName: (firstName) => set(() => ({ firstName })),
}));

// Create the last name store
export const useLastNameStore = create<LastNameState>((set) => ({
  lastName: '',
  setLastName: (lastName) => set(() => ({ lastName })),
}));
