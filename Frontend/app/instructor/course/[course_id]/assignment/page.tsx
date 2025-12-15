import React from 'react';
import AssignmentTable from '@/components/INS/INSAssignment/AssignmentTable';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';

export const metadata = {
  title: 'Assignments list',
  description: 'Manage assignments list in the course page.',
};

const Assignment = () => {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <AssignmentTable />
    </Suspense>
  );
};

export default Assignment;
