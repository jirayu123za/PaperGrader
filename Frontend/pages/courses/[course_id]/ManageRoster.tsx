import React from 'react';
import LeftMain from '../../../components/LeftMain'; // นำเข้า LeftMain component
import CourseRoster from '../../../components/CourseRoster'; // นำเข้า CourseRoster component

const ManageRoster: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50"> 
    <LeftMain /> 
    <div className="flex-grow p-6">
      <h1 className="text-2xl font-bold mb-4">Roster</h1>
      <CourseRoster /> 
    </div>
  </div>
  );
};

export default ManageRoster;
