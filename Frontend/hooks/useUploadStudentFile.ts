import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface UploadFileParams {
  assignmentId: string;
  courseId: string;  // เพิ่ม courseId เป็น parameter
  file: File;
}

// Hook สำหรับอัปโหลดไฟล์ของนักศึกษา
const uploadStudentFile = async ({ assignmentId, courseId, file }: UploadFileParams) => {
  console.log('Uploading file:', file, 'for assignment:', assignmentId, 'and course:', courseId);  // ตรวจสอบข้อมูลที่กำลังอัปโหลด
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await axios.post(`/api/api/student/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      assignment_id: assignmentId,  // ส่ง assignmentId เป็น query parameter
      course_id: courseId,          // เพิ่ม courseId เป็น query parameter
    },
  });

  return data;
};


export const useUploadStudentFile = () => {
  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: (data) => {
      console.log('Upload successful:', data);  // Log success เมื่ออัปโหลดสำเร็จ
      alert(`File uploaded successfully! Submission ID: ${data.submission.SubmissionID}`);  // แจ้งเตือนสำเร็จพร้อมกับ Submission ID
    },
    onError: (error) => {
      console.error('Upload failed:', error);  // Log error เมื่ออัปโหลดล้มเหลว
      alert('Failed to upload the file. Please try again.');  // แจ้งเตือนเมื่ออัปโหลดล้มเหลว
    },
  });
};
