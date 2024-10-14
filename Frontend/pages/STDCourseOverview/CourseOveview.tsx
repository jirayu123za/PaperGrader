import React from 'react';
import STD_LeftMain from '../../components/STD/STD_Leftmain'; // นำเข้า STD_LeftMain
import CourseCard from '../../components/CourseCard'; // นำเข้า CourseCard

const STDCourse: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ซ้ายมือเป็น STD_LeftMain */}
      <STD_LeftMain /> 

      {/* ขวามือเป็น CourseCard */}
      <div className="w-1/4 p-6">
        <CourseCard />
      </div>
    </div>
  );
};

export default STDCourse;
