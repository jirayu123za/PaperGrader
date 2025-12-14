"use client";

import React, { Suspense } from 'react';
import { CourseOverView } from '@/components/INS/CourseOverView/CourseOverView';
import { Loader } from '@mantine/core';

export default function INSCourseOverview() {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <CourseOverView />
    </Suspense>
  );
};
