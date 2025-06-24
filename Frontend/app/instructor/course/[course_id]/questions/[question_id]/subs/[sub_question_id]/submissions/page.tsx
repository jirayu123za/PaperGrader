import React, { Suspense } from 'react'
import { Loader } from '@mantine/core';
import SubQuestionsListClient from '@/components/client/SubQuestionsListClient';

export const metadata = {
  title: 'Submissions',
  description: 'Manage Submissions for the assignment in the course process page.',
};

export default async function page({ params }: { 
  params: Promise<{ course_id: string; question_id: string; sub_question_id: string }>;
}) {
  const { course_id, question_id, sub_question_id } = await params;

  return (
    <>
        <Suspense fallback={<Loader size="sm" />}>
            <SubQuestionsListClient course_id={course_id} question_id={question_id} sub_question_id={sub_question_id} />
        </Suspense>    
    </>
  )
}
