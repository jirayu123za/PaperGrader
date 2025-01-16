import React from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Alert, Anchor, FileInput, Box, Flex, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const INSManageScans: React.FC = () => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  return (
      <Flex justify="space-between" align="flex-start" style={{ width: '100%' }}>
        {/* Left Section */}
        <Box style={{ flex: 2, paddingRight: '0.5rem' }}>
          {/* Title */}
          <Title order={3} mb="md" style={{ color: '#2e2e2e' }}>
            Manage Scans
          </Title>

          {/* Warning Alert */}
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

          {/* Info Alert */}
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
          <Text size="sm" mb="xs" mt={16}>
            Upload scans in PDF format. A single file can contain multiple student submissions (it is
            more efficient to scan in batches). Multiple files can be uploaded at once.
          </Text>

          <Text size="sm">
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
          </Text>
        </Box>

        {/* Right Section */}
        <Box
          style={{
            flex: 1,
            border: '1px dashed #dee2e6',
            padding: '16px',
            margin: '16px',
            marginTop: '50px',
            borderRadius: '4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Text size="sm" c="dimmed" mb="xs">
            Drop files anywhere on the page, or select files using the button below.
          </Text>
          <FileInput placeholder="Select PDF Files" accept=".pdf" size="xs" />
        </Box>
      </Flex>
  );
};

export default INSManageScans;
