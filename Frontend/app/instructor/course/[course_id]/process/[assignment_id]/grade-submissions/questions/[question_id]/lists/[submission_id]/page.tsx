//lists from main question
import React, { Suspense } from 'react';
import GradePdfViewer from '@/components/INS/GradePdfViewer';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade submissions - Main question lists',
  description: 'Manage and grade submissions for main question lists in the assignment.',
};

export default function ListsMainGradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <GradePdfViewer/>
    </Suspense>
  );
}