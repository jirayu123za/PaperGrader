import React from 'react';
import STD_CourseDashboard from '@/components/STD/STD_CourseDashboard';

export const metadata = {
  title: 'Student course dashboard',
  description: 'Student course dashboard for PaperGrader',
};

const STDCourseDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="grow p-6">
        <div>
          <STD_CourseDashboard/>
        </div>
      </div>
    </div>
  );
};

export default STDCourseDashboard;
