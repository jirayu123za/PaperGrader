//main question 

import React from 'react';
import GradePdfViewer from '@/components/INS/GradePdfViewer';

export const metadata = {
  title: 'Grade',
  description: 'Grade the assignment.',
};

export default function MainGradeSubmissions() {
  return (
    <GradePdfViewer/>
  );
}