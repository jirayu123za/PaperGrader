// app/instructor/course/[course_id]/process/[assignment_id]/create-outline/page.tsx
import React from 'react';
import PDFViewer from '@/components/PDFViewer';

export const metadata = {
  title: 'Create Outline',
  description: 'Create a new outline for the assignment.',
};

export default function CreateOutlinePage() {
  return (
    <PDFViewer/>
  );
}
