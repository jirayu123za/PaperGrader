//lists from sub question
import React, { Suspense } from 'react';
import { Loader } from '@mantine/core';
import { SubmissionGrader } from '@/components/client/SubmissionGrader';

export const metadata = {
  title: 'Grade submissions - Sub question lists',
  description: 'Manage and grade submissions for sub question lists in the assignment.',
};

export default function ListsSubGradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <SubmissionGrader />
    </Suspense>
  );
}