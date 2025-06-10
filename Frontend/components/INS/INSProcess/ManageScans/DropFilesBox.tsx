'use client';
import '@mantine/dropzone/styles.css';
import React from 'react'
import { useUploadSubmissionFile } from '@/hooks/ManageScan/useUploadSubmissionFile';
import { Group, Progress, Text } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX } from '@tabler/icons-react';
import { FaRegFilePdf } from 'react-icons/fa';

type Props = {
  course_id: string;
  assignment_id: string;
};

export const DropFilesBox: React.FC<Props> = ({ course_id, assignment_id }) => {
  const { mutate: uploadSubmissionFile, isPending } = useUploadSubmissionFile(assignment_id);
  const handleFileChange = (files: File[]) => {
    uploadSubmissionFile({
      assignment_id: assignment_id as string,
      course_id: course_id as string,
      files,
    });
  };

  return (
    <Dropzone
      w='50%'
      loading={isPending}
      onDrop={(files) => handleFileChange(files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={50 * 1024 ** 2}
      accept={PDF_MIME_TYPE}
      multiple
      loaderProps={{ children: 'Loading...' }}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <FaRegFilePdf size={52} color="var(--mantine-color-dimmed)" />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            {'Drag PDFs here or click to select files'}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach as many files as you like, each file should not exceed 50MB
          </Text>
        </div>
      </Group>
    </Dropzone>
  )
}
