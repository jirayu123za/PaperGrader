// app/instructor/course/[course_id]/process/[assignment_id]/create-outline/page.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Loader } from '@mantine/core';
const PDFViewerClient = dynamic(() => import('@/components/client/PDFViewerClient'), {
  ssr: false,
});

export default function CreateOutlinePage() {
  const params = useParams();
  const assignment_id = params?.assignment_id as string;
  const course_id = params?.course_id as string;

  return (
    <>
      {assignment_id && course_id ? (
        <PDFViewerClient/>
      ) : (
        <Loader />
      )}
    </>        
  );
}
