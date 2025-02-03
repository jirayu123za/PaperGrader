import { useEffect } from 'react';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionFileStore } from '../store/useINS_SubmissionStore';
import axios from 'axios';

interface FetchFileParams {
  courseId: string | undefined;
  assignmentId: string | undefined;
}

interface UseFetchFileReturn {
  form: UseFormReturnType<{ pdfUrl: string; loading: boolean }>; // ชนิดข้อมูลของ form
  refetch: () => Promise<void>; // ฟังก์ชันสำหรับดึงข้อมูลใหม่
}

export const useFetchFile = ({ courseId, assignmentId }: FetchFileParams): UseFetchFileReturn => {
  // สร้าง useForm เพื่อจัดการ state พร้อมกับกำหนด Generic Type
  const form = useForm<{ pdfUrl: string; loading: boolean }>({
    initialValues: {
      pdfUrl: '', // URL ของไฟล์ PDF
      loading: true, // สถานะการโหลด
    },
  });

  // ฟังก์ชันดึง URL จาก backend
  const fetchFileUrl = async () => {
    if (!courseId || !assignmentId) return;

    try {
      form.setFieldValue('loading', true); // เริ่มโหลด
      const response = await axios.get('/api/api/instructor/template/url', {
        params: { course_id: courseId, assignment_id: assignmentId },
      });

      form.setFieldValue('pdfUrl', response.data.url || ''); // เก็บ URL ไว้ใน form
    } catch (error) {
      console.error('Error fetching PDF URL:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      form.setFieldValue('loading', false); // โหลดเสร็จ
    }
  };

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchFileUrl();
  }, [courseId, assignmentId]);

  // ส่งค่าออกไป
  return {
    form,
    refetch: fetchFileUrl, // ฟังก์ชัน refetch เพื่อดึงข้อมูลใหม่
  };
};

interface SubmissionFileResponse {
  message: string;
  submission_file_url: string;
}

export const useFetchSubmissionFile = (course_id: string, assignment_id: string, submission_id: string) => {
  const setSubmissionFile = useSubmissionFileStore((state) => state.setSubmissionFile);

  return useQuery<SubmissionFileResponse>({
    queryKey: ['submission_file_url', course_id, assignment_id, submission_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/submission/fileURL', {
        params: {
          course_id: course_id,
          assignment_id: assignment_id,
          submission_id: submission_id,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch submission file');
      }
      if (response.data.submission_file_url) {
        setSubmissionFile({ submission_file_url: response.data.submission_file_url });
      }
      return response.data;
    },
    enabled: !!course_id && !!assignment_id && !!submission_id,
  });
};