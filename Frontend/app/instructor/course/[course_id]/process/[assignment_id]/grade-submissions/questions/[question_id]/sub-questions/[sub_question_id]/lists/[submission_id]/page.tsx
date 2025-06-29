//lists from sub question
import React, { Suspense } from 'react';
import GradePdfViewer from '@/components/INS/GradePdfViewer';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade submissions - Sub question lists',
  description: 'Manage and grade submissions for sub question lists in the assignment.',
};

export default function ListsSubGradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <GradePdfViewer/>
    </Suspense>
  );
}