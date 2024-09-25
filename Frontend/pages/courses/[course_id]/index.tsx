import React from 'react';
import { useRouter } from 'next/router';
import LeftMain from '../../../components/LeftMain'; 
import INTDashBoard from '../../../components/INSDashBoard'; 

const Dashboard = () => {
  const router = useRouter();
  const { course_id } = router.query;

  // ตรวจสอบและแปลง course_id ให้เป็น string หรือกำหนดค่าเริ่มต้นเป็น ''
  const courseId = Array.isArray(course_id) ? course_id[0] : course_id || '';

  return (
    <div className="flex min-h-screen bg-gray-50"> 
      <LeftMain courseId={courseId} /> {/* ส่ง courseId ที่แปลงแล้วไปที่ LeftMain */}
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Page </h1>
        <INTDashBoard courseId={courseId} /> {/* ส่ง courseId ที่แปลงแล้วไปที่ INTDashBoard */}
      </div>
    </div>
  );
};

export default Dashboard;
