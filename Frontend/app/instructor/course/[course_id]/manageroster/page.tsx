
import React, { Suspense }  from 'react';
import { ManageRosterClient } from '@/components/client/ManageRosterClient';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Manage Roster',
  description: 'Manage the course roster and sections.',
};

const ManageRoster: React.FC = () => {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <ManageRosterClient/>
    </Suspense>
  );
};

export default ManageRoster;
