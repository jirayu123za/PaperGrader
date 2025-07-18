import React, { Suspense } from 'react';
import STD_Dashboard from '@/components/STD/STD_Dashboard';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Student Dashboard',
  description: 'Student Dashboard for PaperGrader',
};

export default async function STDDashboard() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <STD_Dashboard /> 
    </Suspense>
  );
};
