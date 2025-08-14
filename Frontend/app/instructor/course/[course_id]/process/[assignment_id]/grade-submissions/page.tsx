import React, { Suspense } from 'react'
import { TabsGradeSubmissionsClient } from '@/components/client/TabsGradeSubmissionsClient';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade Submissions',
  description: 'Grade Submissions for the assignment in the course process page.',
};

export default async function Submissions() {
  return (
    <>
      <Suspense fallback={<Loader size="lg" />}>
        <TabsGradeSubmissionsClient />
      </Suspense>    
    </>
  );
}
