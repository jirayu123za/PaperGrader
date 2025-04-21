"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import CreateOutline from '@/components/INS/INSProcess/Right/Create';
import { useParams } from 'next/navigation';
import { Container, Flex, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';


export default function CreateOutlinePage() {
  const params = useParams();
  const assignment_id = params?.assignment_id as string;
  const course_id = params?.course_id as string;

  const form = useForm({
    initialValues: {
      isOutlineCollapsed: false,
      currentPage: 1,
    },
  });

  const PDFViewerClient = dynamic(() => import('@/components/client/PDFViewerClient'), {
    ssr: false,
  });
  

  return (
    <Container fluid style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <Flex style={{ flex: 1, overflow: 'auto', justifyContent: 'center', alignItems: 'center' }}>
        {assignment_id && course_id ? (
          <PDFViewerClient courseId={course_id} assignmentId={assignment_id} />
        ) : (
          <Loader />
        )}
      </Flex>
      <Flex
        style={{
          width: form.values.isOutlineCollapsed ? '3%' : '30%',
          overflowY: 'auto',
          borderLeft: form.values.isOutlineCollapsed ? 'none' : '1px solid transparent',
        }}
        onClick={() => form.setFieldValue('isOutlineCollapsed', false)}
      >
        {!form.values.isOutlineCollapsed && (
          <CreateOutline
            currentPage={form.values.currentPage}
            onToggleCollapse={() =>
              form.setFieldValue('isOutlineCollapsed', !form.values.isOutlineCollapsed)
            }
          />
        )}
      </Flex>
    </Container>
  );
}
