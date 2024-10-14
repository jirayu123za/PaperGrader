import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Hook สำหรับดึงไฟล์ของอาจารย์จาก API
const fetchInstructorFile = async (courseId: string, assignmentId: string) => {
  const response = await axios.get('api/api/student/files/download', {
    params: {
      course_id: courseId,
      assignment_id: assignmentId,
    },
  });
  console.log('API Response:', response.data);

  // API ส่งกลับมาเป็น array ของ URLs ใน response.data.files และชื่อไฟล์ใน response.data.urls
  const files = response.data.files;
  const fileNames = response.data.urls;

  return { files, fileNames };  // ส่งคืนทั้ง URLs และชื่อไฟล์
};

export const useFetchInstructorFile = (courseId: string, assignmentId: string) => {
  return useQuery({
    queryKey: ['instructorFile', courseId, assignmentId],
    queryFn: () => fetchInstructorFile(courseId, assignmentId),
  });
};




//   const fetchInstructorFile = async (assignmentId: string) => {
//     const response = await axios.get(`/api/assignments/${assignmentId}/instructor-file`, {
//       responseType: 'blob',  // ดึงเป็นไฟล์ประเภท blob
//     });
  
//     // ดึงชื่อไฟล์จาก header ของ response ถ้า API ส่งมาใน 'Content-Disposition'
//     const contentDisposition = response.headers['content-disposition'];
//     let fileName = 'unknown.pdf';  // กำหนดชื่อไฟล์เริ่มต้น
  
//     if (contentDisposition) {
//       const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
//       if (fileNameMatch?.[1]) {
//         fileName = fileNameMatch[1];
//       }
//     }
  
//     // สร้าง URL สำหรับ blob เพื่อให้สามารถดาวน์โหลดไฟล์ได้
//     const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
  
//     return { fileUrl, fileName };
//   };
//   export const useFetchInstructorFile = (assignmentId: string) => {
//     return useQuery({
//       queryKey: ['instructorFile', assignmentId],
//       queryFn: () => fetchInstructorFile(assignmentId),
//     });
//   };