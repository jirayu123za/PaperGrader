import React, { useRef } from 'react';
import { useRouter } from 'next/router';
import { Text, Alert, Anchor, FileInput, Box, Flex, Progress } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useUploadSubmissionFile } from '../../../hooks/ManageScan/useUploadSubmissionFile';

const INSManageScans: React.FC = () => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const fileInputRef = useRef<HTMLButtonElement>(null);
  const { mutate: uploadSubmissionFile, isPending } = useUploadSubmissionFile();

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      console.log(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (files: File[]) => {
    // files.forEach(file => console.log(file));
    uploadSubmissionFile({
      assignment_id: assignment_id as string,
      course_id: course_id as string,
      files: files,
    });
  };

  return (
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

        {/* Descriptions */}
        {/* <Text size="sm" mb="xs" mt={16}>
          Upload scans in PDF format. A single file can contain multiple student submissions (it is
          more efficient to scan in batches). Multiple files can be uploaded at once.
        </Text> */}

        {/* <Text size="sm">
          PaperGrader attempts to split each uploaded scan into submissions. The proposed split depends
          on the length of the{' '}
          <Anchor
            href={`/courses/${course_id}/process/${assignment_id}/question-outline`}
            style={{ textDecoration: 'underline', fontSize: '0.80rem' }}
          >
            question outline
          </Anchor>
          . For scans that are not automatically split, click <b>Show</b> to review the proposed
          submissions (you can change split points and re-order pages), then click <b>Create
          Submissions</b>.
        </Text> */}
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
            />          
          </>
        )}
      </Box>
    </Flex>
  );
};

export default INSManageScans;
