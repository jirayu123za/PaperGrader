
import React from 'react';
import AssignmentTable from '@/components/INS/INSAssignment/AssignmentTable';

export const metadata = {
  title: 'Assignments list',
  description: 'Manage assignments list in the course page.',
};

const Assignment = () => {
  return (
    <div className="grow p-6">
      <AssignmentTable />
    </div>
  );
};

export default Assignment;
