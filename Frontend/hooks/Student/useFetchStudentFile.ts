import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE, api, qf } from '@/src/lib/api';

export const useFetchStudentFile = (assignment_id: string, course_id: string) => {
  return useQuery({
    queryKey: ["studentFile", assignment_id, course_id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/student/file`, {
        params: { assignment_id, course_id },
      });
      return data; // backend ควรส่ง { fileUrl, fileName }
    },
    enabled: !!assignment_id && !!course_id,
  });
};
