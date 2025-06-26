import INSManageScansClient from '@/components/client/INSManageScansClient';
import { Loader } from '@mantine/core';
import { Suspense } from 'react';

export const metadata = {
  title: 'Manage submissions',
  description: 'Manage submissions list for the assignment in the course process page.',
};

export default async function Page({ params }: { 
  params: Promise<{ course_id: string; assignment_id: string }>
}) {
  const { course_id, assignment_id } = await params;

  return (
    <div className="flex min-h-screen">
      <div className="grow p-4">
        <Suspense fallback={<Loader size="sm" />}>
          <INSManageScansClient
            course_id={course_id}
            assignment_id={assignment_id}
          />
        </Suspense>
      </div>
    </div>
  );
}