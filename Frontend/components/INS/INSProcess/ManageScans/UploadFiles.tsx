"use client";
import React from 'react';
import { Flex } from '@mantine/core';
import { SubmissionsListTable } from './SubmissionsListTable';
import { AlertForSubmission } from './AlertForSubmission';
import { DropFilesBox } from './DropFilesBox';

type Props = {
  course_id: string;
  assignment_id: string;
};

const UploadFiles: React.FC<Props> = ({ course_id, assignment_id }) => {
  return (
    <Flex direction="column" gap="md">
      <Flex justify="space-between" gap="md">
        {/* Left Section */}
        <SubmissionsListTable assignment_id={assignment_id} />
        {/* Right Section */}
        <DropFilesBox course_id={course_id} assignment_id={assignment_id}/>
      </Flex>
      {/*Under right Section*/}
      <Flex justify="end" mt="md">
        <AlertForSubmission />
      </Flex>
    </Flex>
  );
};

export default UploadFiles;
