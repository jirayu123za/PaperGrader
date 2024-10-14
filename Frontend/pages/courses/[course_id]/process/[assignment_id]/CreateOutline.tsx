import { useRouter } from 'next/router';
import LeftProcess from '../../../../../components/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreateOutline() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query; // ดึง course_id มาด้วย
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ใช้ useEffect เพื่อดึง URL ของไฟล์ PDF ที่เกี่ยวข้องกับ assignmentId และ courseId
  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (assignment_id && course_id) {
        try {
          const response = await axios.get('/api/api/instructor/template/url', {
            params: {
              course_id: course_id, // ส่ง course_id ผ่าน params
              assignment_id: assignment_id, // ส่ง assignment_id ผ่าน params
            },
          });
          console.log("PDF URL:", response.data.url);
          setPdfUrl(response.data.url); // เก็บ URL ของไฟล์ PDF
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
        } finally {
          setLoading(false); // เมื่อโหลดเสร็จแล้ว setLoading เป็น false
        }
      }
    };
    fetchPdfUrl();
  }, [assignment_id, course_id])
  
  return (
    <div className="flex min-h-screen">
      {/* แถบเมนูทางซ้าย */}
      <LeftProcess />

      {/* ส่วนของการอัพโหลดไฟล์ */}
      <div className="flex-grow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : pdfUrl ? (
          <PDFViewer fileUrl={pdfUrl} /> // ส่ง URL ของไฟล์ PDF ไปยัง PDFViewer
        ) : (
          <div>No PDF available</div>
        )}
      </div>
    </div>
  );
}
