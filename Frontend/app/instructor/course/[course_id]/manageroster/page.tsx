
import React from 'react';
import { ManageRosterClient } from '@/components/client/ManageRosterClient';

export const metadata = {
  title: 'Manage Roster',
  description: 'Manage the course roster and sections.',
};

const ManageRoster: React.FC = () => {
  return (
    <ManageRosterClient/>
  );
};

export default ManageRoster;
