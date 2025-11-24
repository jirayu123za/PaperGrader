"use client";
import React from 'react';
import { Box, Flex, Image, Text } from '@mantine/core';
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
  const hasSubmissions = submissionsList.length > 0;

  return (
    <Flex direction="column" gap="md" h="100%">
      {/* Top: Submissions Table */}
      {hasSubmissions && (
        <Box className='flex-1'>
          <SubmissionsListTable assignment_id={assignment_id} />
        </Box>
      )}

      {/* Bottom: Drop zone and alert aligned vertically */}
      <Flex direction="row" gap="md" style={{ flexShrink: 0 }}>
        <DropFilesBox course_id={course_id} assignment_id={assignment_id} />
        <AlertForSubmission />
      </Flex>
      
      {/* If no submissions: Show fallback UI below Drop zone */}
      {!hasSubmissions && (
        <Flex direction="column" align="center" justify="center" gap="sm" py="xl" w='55%'>
          <Image
            src="/Image/table/no_data.svg"
            alt="No submissions found"
            w="auto"
            h={150}
            fit="contain"
            fallbackSrc="https://placehold.co/200x200?text=Placeholder"
          />
          <Text size="lg" fw={500} mt="md">
            No submissions found
          </Text>
          <Text size="sm" c="dimmed">
            You haven’t uploaded any submissions yet.
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default UploadFiles;
