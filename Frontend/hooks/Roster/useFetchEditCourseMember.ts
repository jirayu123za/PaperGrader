import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEditCourseMemberStore } from '../../store/useEditCourseMemberStore';

interface EditCourseMemberResponse {
  email: string;
  full_name: string;
  personal_data_id: string;
  role_type: string;
  section_name: string;
  student_code: string;
}

export const useFetchEditCourseMember = (course_id: string, personal_data_id: string) => {
    const setEditMember = useEditCourseMemberStore((state) => state.setEditMember);
  
    return useQuery<EditCourseMemberResponse, Error>({
      queryKey: ['member', course_id, personal_data_id],
      queryFn: async (): Promise<EditCourseMemberResponse> => {
        const response = await axios.get('/api/api/instructor/roster/personal', {
          params: { course_id, personal_data_id },
        });
  
        if (response.status !== 200) {
          throw new Error('Failed to fetch personal data');
        }
  
        const data = response.data.personalData[0];
        setEditMember(data); // บันทึกข้อมูลลงใน Zustand store ที่นี่
        return data;
      },
      enabled: !!course_id && !!personal_data_id,
    });
  };
  