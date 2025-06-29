//main question 
import React, { Suspense } from 'react';
import GradePdfViewer from '@/components/INS/GradePdfViewer';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade submissions - main question',
  description: 'Grade the main question from question name submissions for the assignment.',
};

export default function MainGradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <GradePdfViewer/>      
    </Suspense>
  );
}