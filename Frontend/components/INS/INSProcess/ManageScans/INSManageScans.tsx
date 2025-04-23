"use client";

import React, { useRef } from 'react';
import dayjs from 'dayjs';
import { Text, Alert, Anchor, FileInput, Box, Flex, Progress, List, ScrollArea, Loader, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useUploadSubmissionFile } from '../../../../hooks/ManageScan/useUploadSubmissionFile';
import { FaRegFilePdf } from "react-icons/fa";
import { useFetchSubmissionFiles } from '../../../../hooks/ManageScan/useFetchSubmissionFiles';
import { useSubmissionFilesStore } from '../../../../store/ManageScan/useSubmissionFiles';

type Props = {
  course_id: string;
  assignment_id: string;
};

const INSManageScans: React.FC<Props> = ({ course_id, assignment_id }) => {
  const fileInputRef = useRef<HTMLButtonElement>(null);
  const { data: submissionFiles, isLoading } = useFetchSubmissionFiles(assignment_id as string);
  const { submissions, visibleCount, setVisibleCount } = useSubmissionFilesStore();
  const { mutate: uploadSubmissionFile, isPending } = useUploadSubmissionFile();

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);  
    if (files.length > 0) {
      handleFileChange(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (files: File[]) => {
    uploadSubmissionFile({
      assignment_id: assignment_id as string,
      course_id: course_id as string,
      files: files,
    });
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] hh:mm A');
  };

  const handleShowMore = () => {
    setVisibleCount(visibleCount + 7);
  };

  return (
    <Flex direction="column" gap="md">
      <Flex justify="space-between" align="flex-start" gap="md">
        <Box w="60%">
          <Alert
            icon={<IconAlertCircle size={15} />}
            color="yellow"
            p="md"
            mb={4}
          >
            <Flex align="center">
              <Text size="sm" mr={6}>
                Proposed scan splits: 
              </Text>
              <Text size="sm">
                Proposed scan splits will likely be more accurate if you first set up the{' '}
                <Anchor
                  href={`/courses/${course_id}/process/${assignment_id}/CreateOutline`}
                  style={{ textDecoration: 'underline', fontSize: '0.80rem' }}
                >
                  Assignment Outline
                </Anchor>
                .
              </Text>
            </Flex>
          </Alert>

          <Alert
            icon={<IconAlertCircle size={15} />}
            color="blue"
            p="md"
            mb="xs"
          >
            <Flex align="center">
              <Text size="sm" mr={6}>
                Scanning tips:
              </Text>
              <Text size="sm">
                For more information on scanning best practices, see our{' '}
                <Anchor 
                  href="/scanning-tips" 
                  style={{ textDecoration: 'underline', fontSize: '0.80rem' }}
                >
                  scanning tips
                </Anchor>
                .
              </Text>
            </Flex>
          </Alert>
        </Box>

        {/* Right Section */}
        <Box
          style={{
            border: '1px dashed #dee2e6',
            borderRadius: '4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            height: '230px',
            width: '40%',
          }}
          onClick={handleBoxClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {isPending ? (
            <>
              <Progress value={100} animated color="blue" size="md" w="80%" />
              <Text size="sm" c="dimmed" mt="xs">
                Uploading files...
              </Text>
            </>
          ) : (
            <>
              <Text size="sm" c="dimmed">
                Drop files on this area, or click and select files.
              </Text>
              <FileInput 
                placeholder="Select PDF Files" 
                display='none'
                multiple
                ref={fileInputRef}
                onChange={(files) => handleFileChange(files)}
                accept=".pdf" 
                disabled={isPending}
              />          
            </>
          )}
        </Box>
      </Flex>

      <Box>
        <ScrollArea h='430px'>
          <List>
            {submissions.slice(0, visibleCount).map((file) => (
              <Flex key={file.submission_id} align="center" justify="space-between">
                <List.Item p={10} icon={<FaRegFilePdf size={20} />}>
                  <Anchor href="#" size="sm">{file.submission_file_name}</Anchor>{' '}
                  <Text size="xs" c="dimmed">
                    {formatDate(file.submitted_at)}
                  </Text>                
                </List.Item>
              </Flex>
            ))}
            
            {visibleCount < submissions.length && (
            <Flex justify="center" mt="xs">
              <Button variant="light" onClick={handleShowMore}>
                Show More
              </Button>
            </Flex>
          )}
          </List>      
        </ScrollArea>
      </Box>
    </Flex>
  );
};

export default INSManageScans;
