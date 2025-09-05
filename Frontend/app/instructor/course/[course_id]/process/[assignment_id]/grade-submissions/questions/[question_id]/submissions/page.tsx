import React, { Suspense } from 'react'
import { Loader } from '@mantine/core';
import MainQuestionsListClient from '@/components/client/MainQuestionsListClient';

export const metadata = {
  title: 'Grade Submissions - Main Questions',
  description: 'Manage and grade submissions for main questions in the assignment.',
};

export default async function SubmissionsMainQuestionsPage({ params }: { 
  params: Promise<{ course_id: string; assignment_id: string; question_id: string; sub_question_id: string; }>
}) {
  const { course_id, assignment_id, question_id, sub_question_id } = await params;

  return (
    <>
      <Suspense fallback={<Loader size="sm" />}>
        <MainQuestionsListClient course_id={course_id} assignment_id={assignment_id} question_id={question_id} sub_question_id={sub_question_id} />
      </Suspense>    
    </>
  )
}
