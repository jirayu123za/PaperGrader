import React, { Suspense } from 'react';
import Dashboard from '@/components/STD/Dashboard/Dashboard';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Student Dashboard',
  description: 'Student Dashboard for PaperGrader',
};

export default async function STDDashboard() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <Dashboard /> 
    </Suspense>
  );
};
