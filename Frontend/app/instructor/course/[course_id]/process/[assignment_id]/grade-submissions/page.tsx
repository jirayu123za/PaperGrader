import { TabsGradeSubmissionsClient } from '@/components/client/TabsGradeSubmissionsClient';
import React, { Suspense } from 'react'
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade Submissions',
  description: 'Grade Submissions for the assignment in the course process page.',
};

export default async function Submissions({ params }: { 
  params: Promise<{ course_id: string; assignment_id: string }>
}) {
  const { course_id, assignment_id } = await params;

  return (
    <>
      <Suspense fallback={<Loader size="lg" />}>
        <TabsGradeSubmissionsClient />
      </Suspense>    
    </>
  );
}
