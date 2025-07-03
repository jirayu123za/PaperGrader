"use client";
import React from 'react';
import { Flex } from '@mantine/core';
import { SubmissionsListTable } from './SubmissionsListTable';
import { AlertForSubmission } from './AlertForSubmission';
import { DropFilesBox } from './DropFilesBox';
import { useSubmissionFilesStore } from '@/store/ManageScan/useSubmissionFiles';

type Props = {
  course_id: string;
  assignment_id: string;
};

const UploadFiles: React.FC<Props> = ({ course_id, assignment_id }) => {
  const { submissionsList } = useSubmissionFilesStore();

  return (
    <Flex direction="column" gap="md">
      {/* Top: Submissions Table */}
      <SubmissionsListTable assignment_id={assignment_id} />

      {/* Bottom: Drop zone and alert aligned vertically */}
      <Flex direction="row" gap="md">
        <DropFilesBox course_id={course_id} assignment_id={assignment_id} />
        <AlertForSubmission />
      </Flex>
    </Flex>
  );
};

export default UploadFiles;
