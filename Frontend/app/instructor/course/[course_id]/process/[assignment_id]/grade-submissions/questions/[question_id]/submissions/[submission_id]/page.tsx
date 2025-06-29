//main question 
import React, { Suspense } from 'react';
import { Loader } from '@mantine/core';
import { SubmissionGrader } from '@/components/client/SubmissionGrader';

export const metadata = {
  title: 'Grade submissions - main question',
  description: 'Grade the main question from question name submissions for the assignment.',
};

export default function MainGradeSubmissions() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <SubmissionGrader />  
    </Suspense>
  );
}