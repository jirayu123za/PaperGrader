import React from 'react';
import INTAssignment from '../../../components/INS/INSAssignment/INSAssignment';
import LeftMain from '../../../components/LeftINS/LeftMain';

const Assignment = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain/>
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Assignment Page</h1>
        <INTAssignment/>
      </div>
    </div>
  );
};

export default Assignment;
