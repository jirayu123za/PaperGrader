
import React from 'react';
import INTAssignment from '@/components/INS/INSAssignment/INSAssignment';
import { ScrollArea } from '@mantine/core';

const Assignment = () => {
  return (
    <div className="flex-grow p-6 overflow-hidden">
      <ScrollArea style={{ height: 'calc(100vh - 96px)' }} type="auto">
        <INTAssignment />
      </ScrollArea>
    </div>
  );
};

export default Assignment;
