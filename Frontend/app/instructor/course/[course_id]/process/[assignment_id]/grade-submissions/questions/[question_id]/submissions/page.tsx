import React, { Suspense } from 'react'
import { Loader } from '@mantine/core';
import MainQuestionsListClient from '@/components/client/MainQuestionsListClient';

export const metadata = {
  title: 'Submissions list',
  description: 'Manage Submissions list from main questions of the assignment in the course process page.',
};

export default async function SubmissionsMainQuestionsPage({ params }: { 
  params: Promise<{ course_id: string; assignment_id: string; question_id: string }>
}) {
  const { course_id, assignment_id, question_id } = await params;

  return (
    <>
      <Suspense fallback={<Loader size="sm" />}>
        <MainQuestionsListClient course_id={course_id} assignment_id={assignment_id} question_id={question_id} />
      </Suspense>    
    </>
  )
}
