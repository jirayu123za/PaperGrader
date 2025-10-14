import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/src/lib/api';

type LogoutResponse = { ok?: boolean; message?: string; post_logout_url?: string };

export const useFetchLogout = () => {
  const Router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_BASE}/user/logout`, { withCredentials: true, validateStatus: () => true });
      const data: LogoutResponse = res.data ?? {};
      if (res.status !== 200) {
        throw new Error(data.message || `Logout failed (status ${res.status})`);
      }
      return data;
    },
    onSuccess: (data) => {
      try {
        sessionStorage.removeItem("cmu_oauth_state");

        if (typeof data?.post_logout_url === "string") {
          window.location.assign(data.post_logout_url);
          return;
        }

      } catch {
        console.log("No session storage access");
      }
      Router.replace('/');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    },
  });
};
