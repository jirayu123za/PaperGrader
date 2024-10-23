import { useRouter } from 'next/router';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAssignmentStore } from '../../../../../store/useAssignmentStore';

export default function Submissions() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query; // ดึง assignment_id และ course_id มาจาก URL
  const { assignments } = useAssignmentStore(); // ดึง assignments จาก Zustand Store
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // หา assignment_name จาก assignments ใน Zustand Store
  const selectedAssignment = assignments.find((assignment) => assignment.assignment_id === assignment_id);
  const assignmentName = selectedAssignment ? selectedAssignment.assignment_name : 'No Assignment';

  // ดึงข้อมูล PDF URL
  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (assignment_id && course_id) {
        try {
          const response = await axios.get('/api/api/instructor/template/url', {
            params: {
              course_id: course_id,
              assignment_id: assignment_id,
            },
          });
          setPdfUrl(response.data.url); // เก็บ URL ของไฟล์ PDF
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPdfUrl();
  }, [assignment_id, course_id]);

  return (
    <div className="flex min-h-screen">
      {/* แถบเมนูทางซ้าย */}
      <LeftProcess assignment_name={assignmentName} course_id={course_id as string} process_id={assignment_id as string} />

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
