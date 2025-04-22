"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Container, Flex, Loader } from '@mantine/core';
const PDFViewerClient = dynamic(() => import('@/components/client/PDFViewerClient'), {
  ssr: false,
});

export default function CreateOutlinePage() {
  const params = useParams();
  const assignment_id = params?.assignment_id as string;
  const course_id = params?.course_id as string;

  return (
    <Container fluid style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <Flex style={{ flex: 1, overflow: 'auto', justifyContent: 'center', alignItems: 'center' }}>
        {assignment_id && course_id ? (
          <PDFViewerClient/>
        ) : (
          <Loader />
        )}
      </Flex>
    </Container>
  );
}
