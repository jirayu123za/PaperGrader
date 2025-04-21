import React, { useEffect, useState } from 'react';
import STD_LeftMain from '../../components/STD/STD_LeftAss';
import PDFViewer from '../../components/PDFViewer'; // นำเข้า PDFViewer

const STDAssignment = () => {
  const [data, setData] = useState<any>(null); // สถานะที่จะเก็บข้อมูลจาก JSON


  // ถ้ายังโหลดข้อมูลอยู่จะแสดงข้อความนี้
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-1/5 max-w-xs">
        <STD_LeftMain 
          studentId={data.studentId} 
          courseName={data.courseName} 
          instructors={data.instructors} 
        />
      </div>

      {/* Right Content */}
      <div className="flex-grow p-4">
        <PDFViewer /> {/* แสดง PDF Viewer */}
      </div>
    </div>
  );
};

export default STDAssignment;
