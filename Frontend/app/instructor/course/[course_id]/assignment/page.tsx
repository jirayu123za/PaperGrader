
import React from 'react';
import AssignmentTable from '@/components/INS/INSAssignment/AssignmentTable';
import { Divider } from '@mantine/core';

export const metadata = {
  title: 'Assignments list',
  description: 'Manage assignments list in the course page.',
};

const Assignment = () => {
  return (
    <>
      <Divider size="sm" mx="lg" my="md"/>
      <div className="grow p-4">
        <AssignmentTable />
      </div>
    </>
  );
};

export default Assignment;
