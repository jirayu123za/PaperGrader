import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface UploadFileParams {
  assignment_id: string;
  course_id: string;
  file: File;
}

const uploadStudentFile = async ({ assignment_id, course_id, file }: UploadFileParams) => {
  console.log('Uploading file:', file, 'for assignment:', assignment_id, 'and course:', course_id);
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`/api/api/student/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      assignment_id: assignment_id,
      course_id: course_id,
    },
  });

  return data;
};


export const useUploadStudentFile = () => {
  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      alert(`File uploaded successfully! Submission ID: ${data.submission.SubmissionID}`);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert('Failed to upload the file. Please try again.');
    },
  });
};
