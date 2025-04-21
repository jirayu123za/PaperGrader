import React from 'react';
import STD_LeftAss from '../../../components/STD/STD_LeftAss';
import STD_CourseDashboard from '../../../components/STD/STD_CourseDashboard';

const CourseDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <STD_LeftAss/>
      <div className="flex-grow p-6">
        <div>
          <STD_CourseDashboard/>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
