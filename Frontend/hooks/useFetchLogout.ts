import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Router from 'next/router';

export const useFetchLogout = () => {
  return useQuery({
    queryKey: ['logout'],
    queryFn: async () => {
      try {
        const response = await axios.post('/api/api/user/logout');

        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        if (response.status === 200) {
          Router.replace('/');
          return response.data || { message: 'Logout successful' };
        } else {
          throw new Error('Logout failed');
        }
      } catch (error) {
        console.error('Logout error:', error);
        throw new Error('An error occurred while logging out');
      }
    },
    enabled: false,
  });
};
