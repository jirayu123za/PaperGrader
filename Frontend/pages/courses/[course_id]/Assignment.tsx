import React from 'react';
import INTAssignment from '../../../components/INS/INSAssignment/INSAssignment';
import LeftMain from '../../../components/LeftINS/LeftMain';
import { ScrollArea, Title } from '@mantine/core';

const Assignment = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <LeftMain />
      <div className="flex-grow p-6 overflow-hidden">
        {/* <Title order={2} c='#2e2e2e' pt={16} pb={16}>Assignment Page</Title> */}
        {/* ใช้ ScrollArea รอบ INTAssignment */}
        <ScrollArea style={{ height: 'calc(100vh - 96px)' }} type="auto">
          <INTAssignment />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Assignment;
