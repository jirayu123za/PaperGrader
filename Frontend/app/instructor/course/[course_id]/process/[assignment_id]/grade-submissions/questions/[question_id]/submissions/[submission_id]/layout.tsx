import React from 'react';
import { Box } from '@mantine/core';
import { RubricGrader } from '@/components/INS/INSProcess/Right/Grade/RubricGrader';
import GradeBottomBar from '@/components/INS/INSProcess/Bottombar/GradeBottomBar';

export default function SubmissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      <RubricGrader />
      <Box className="fixed bottom-0 left-64 w-[calc(100%-16rem)] border-t border-gray-300 bg-white z-50"      >
        <GradeBottomBar />
      </Box>
    </div>
  );
}
