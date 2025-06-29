//sub question
import React, { Suspense } from 'react';
import { Loader } from '@mantine/core';
import { SubmissionGrader } from '@/components/client/SubmissionGrader';

export const metadata = {
  title: 'Grade submissions - sub question',
  description: 'Grade the sub question from question name submissions for the assignment.',
};

export default function GradeSubQuestion() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <SubmissionGrader /> 
    </Suspense>
  );
}