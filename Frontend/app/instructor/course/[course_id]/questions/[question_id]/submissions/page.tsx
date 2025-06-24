import React, { Suspense } from 'react'
import { Loader, Text } from '@mantine/core';

export const metadata = {
  title: 'Submissions',
  description: 'Manage Submissions for the assignment in the course process page.',
};

export default async function page({ params }: { 
  params: Promise<{ course_id: string; question_id: string }>
}) {
  const { course_id, question_id } = await params;

  return (
    <div className="flex min-h-screen">
      <div className="grow p-4">
        <Suspense fallback={<Loader size="sm" />}>
          <Text>Submissions for Course {course_id}, Question {question_id}</Text>
        </Suspense>
      </div>
    </div>
  )
}
