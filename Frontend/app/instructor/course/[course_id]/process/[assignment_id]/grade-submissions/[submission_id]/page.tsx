import React, { Suspense } from 'react';
import { SubmissionGrader } from '@/components/client/SubmissionGrader';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade submissions - Assignment',
  description: 'Manage and grade submissions for the assignment.',
};

export default function gradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <SubmissionGrader />
    </Suspense>
  );
}