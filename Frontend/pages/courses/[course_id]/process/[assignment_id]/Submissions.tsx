import { useRouter } from 'next/router';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import { useEffect, useState } from 'react';
import { useAssignmentStore } from '../../../../../store/useAssignmentStore';
import INSSubmissions from '../../../../../components/INS/INSSubmissions'; // Import INSSubmissions

export default function Submissions() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query; // ดึง assignment_id และ course_id มาจาก URL
  const { assignments } = useAssignmentStore(); // ดึง assignments จาก Zustand Store
  const [loading, setLoading] = useState<boolean>(true);

  // หา assignment_name จาก assignments ใน Zustand Store
  const selectedAssignment = assignments.find((assignment) => assignment.assignment_id === assignment_id);
  const assignmentName = selectedAssignment ? selectedAssignment.assignment_name : 'No Assignment';

  useEffect(() => {
    setLoading(false); // ปิด loading หลังจาก mount component เรียบร้อย
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* แถบเมนูทางซ้าย */}
      <LeftProcess assignment_name={assignmentName} course_id={course_id as string} process_id={assignment_id as string} />

      {/* ส่วนของการแสดงไฟล์ submissions */}
      <div className="flex-grow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* แสดงรายชื่อไฟล์ที่ถูกส่งมาจาก INSSubmissions */}
            <INSSubmissions
              courseId={course_id as string}
              assignmentId={assignment_id as string}
              onViewPDF={() => {}} // ไม่ต้องตั้งค่า URL ของ PDF
            />
          </>
        )}
      </div>
    </div>
  );
}
