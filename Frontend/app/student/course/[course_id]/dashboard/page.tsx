import React from 'react';
import { CourseDashboard }from '@/components/STD/CourseDashBoard/CourseDashboard';
import { Box } from '@mantine/core';

export const metadata = {
  title: 'Student course dashboard',
  description: 'Student course dashboard for PaperGrader',
};

const CourseDashboardPage: React.FC = () => {
  return (
    <Box>
      <CourseDashboard/>
    </Box>
  );
};

export default CourseDashboardPage; 
