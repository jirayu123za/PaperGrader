// app/dashboard/page.tsx
import INTDashBoard from '@/components/INS/INSDashBoard/INSDashBoard';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';

export default async function Dashboard() {
  return (
    <div className="p-6 w-full">
      <Suspense fallback={<Loader size="sm" />}>
        <INTDashBoard />
      </Suspense>
    </div>
  );
}
