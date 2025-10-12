import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { API_BASE, api, qf } from '@/src/lib/api';
import axios from 'axios';

export const useFetchLogout = () => {
  const Router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(`${API_BASE}/user/logout`);
        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        return response.data || { message: 'Logout successful' };
      } catch (error) {
        console.error('Logout error:', error);
        throw new Error('An error occurred while logging out');
      }
    },
    onSuccess: () => {
      Router.replace('/');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    },
  });
};
