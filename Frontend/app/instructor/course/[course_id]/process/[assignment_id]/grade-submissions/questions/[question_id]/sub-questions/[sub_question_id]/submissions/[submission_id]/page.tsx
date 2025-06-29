//sub question
import React, { Suspense } from 'react';
import GradePdfViewer from '@/components/INS/GradePdfViewer';
import { Loader } from '@mantine/core';

export const metadata = {
  title: 'Grade submissions - sub question',
  description: 'Grade the sub question from question name submissions for the assignment.',
};

export default function GradeSubQuestion() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <GradePdfViewer/>    
    </Suspense>
  );
}