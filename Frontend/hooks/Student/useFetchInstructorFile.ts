import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useSubmitAndDownloadModalStore } from '../../store/modal/useSubmitAndDownloadModal';

export const useFetchInstructorFile = () => {
  const { assignment_id, course_id, setFiles } = useSubmitAndDownloadModalStore();

  return useQuery({
    queryKey: ['instructorFile', course_id, assignment_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/student/files/download', {
        params: {
          course_id: course_id,
          assignment_id: assignment_id,
        },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const { files, urls } = response.data;
      setFiles(files, urls);
      return { files, fileNames: urls };
    },
    enabled: !!course_id && !!assignment_id,
  });
}
