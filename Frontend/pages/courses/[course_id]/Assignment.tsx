import React from 'react';
import INTAssignment from '../../../components/INS/INSAssignment/INSAssignment';
import LeftMain from '../../../components/LeftINS/LeftMain';
import { ScrollArea } from '@mantine/core';

const Assignment = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <LeftMain />
      <div className="flex-grow p-6 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Assignment Page</h1>
        {/* ใช้ ScrollArea รอบ INTAssignment */}
        <ScrollArea style={{ height: 'calc(100vh - 96px)' }} type="auto">
          <INTAssignment />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Assignment;
