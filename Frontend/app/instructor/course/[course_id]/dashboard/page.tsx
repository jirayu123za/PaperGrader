import INTDashBoard from '@/components/INS/INSDashBoard/INSDashBoard';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';

export const metadata = {
  title: 'Instructor Dashboard',
  description: 'Instructor Dashboard',
};

export default async function Dashboard() {
  return (
    <div className="p-6 w-full">
      <Suspense fallback={<Loader size="sm" />}>
        <INTDashBoard />
      </Suspense>
    </div>
  );
}
