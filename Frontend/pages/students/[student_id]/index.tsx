import React from 'react';
import STD_LeftMain from '../../../components/STD/STD_Leftmain'; // นำเข้า STD_LeftMain
import STD_Dashboard from '../../../components/STD/STD_Dashboard'; // นำเข้า STD_Dashboard

const TestPage: React.FC = () => {
  const studentId = '12345'; // สมมติว่าเรามี studentId ที่ได้จากการดึงข้อมูล

  return (
    <div className="flex min-h-screen bg-gray-50"> 
    <STD_LeftMain studentId={studentId} /> 
    <div className="flex-grow p-6">
      <h1 className="text-2xl font-bold mb-4"> Dashboard </h1>
      <STD_Dashboard studentId={studentId} /> 
    </div>
  </div>
  );
};

export default TestPage;
