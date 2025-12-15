import { INSDashBoard } from '@/components/INS/INSDashBoard/INSDashBoard';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';

export const metadata = {
  title: 'Instructor Dashboard',
  description: 'Instructor Dashboard',
};

export default async function Dashboard() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <INSDashBoard />
    </Suspense>
  );
}
