import React from 'react';
import LeftMain from '../components/LeftMain'; // นำเข้า LeftMain component
import INTDashBoard from '../components/INSDashBoard'; // นำเข้า INTDashBoard component

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50"> {/* ใช้ flex เพื่อจัดเรียง LeftMain และเนื้อหาของ Dashboard ให้อยู่ติดกัน */}
      <LeftMain /> {/* โหลด LeftMain component มาแสดงทางด้านซ้าย */}
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
        {/* แสดง INTDashBoard โดยส่ง courseId เป็น "1" */}
        <INTDashBoard />
      </div>
    </div>
  );
};

export default Dashboard;
