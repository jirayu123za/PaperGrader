import React from 'react';
import { useRouter } from 'next/router';
import LeftMain from '../../../components/LeftINS/LeftMain';
import INTDashBoard from '../../../components/INS/INDDashBoard/INSDashBoard';

const Dashboard = () => {
  const router = useRouter();
  const { course_id } = router.query;

  // ตรวจสอบและแปลง course_id ให้เป็น string หรือกำหนดค่าเริ่มต้นเป็น ''
  const courseId = Array.isArray(course_id) ? course_id[0] : course_id || '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain courseId={courseId} />
      <div className="flex-grow p-6">
        <INTDashBoard courseId={courseId} />
      </div>
    </div>
  );
};

export default Dashboard;
