"use client";
import React from 'react'
import { RubricGrader } from '@/components/INS/INSProcess/Right/Grade/RubricGrader';
import GradePdfViewer  from '@/components/INS/GradePdfViewer';

export const SubmissionGrader = () => {
  return (
    <>
        <GradePdfViewer/>
        <RubricGrader/>
    </>
  );
}
