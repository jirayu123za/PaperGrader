import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Hook สำหรับดึงไฟล์ของอาจารย์
const fetchInstructorFile = async (assignmentId: string) => {
    const response = await axios.get('https://s28.q4cdn.com/392171258/files/doc_downloads/test.pdf', {
      responseType: 'blob',  // ดึงเป็นไฟล์ประเภท blob
    });
    
    // สร้าง URL สำหรับ blob เพื่อให้สามารถดาวน์โหลดไฟล์ได้
    const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
    const fileName = 'test.pdf';  // กำหนดชื่อไฟล์
  
    return { fileUrl, fileName };
  };

  export const useFetchInstructorFile = (assignmentId: string) => {
    return useQuery({
      queryKey: ['instructorFile', assignmentId],
      queryFn: () => fetchInstructorFile(assignmentId),
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