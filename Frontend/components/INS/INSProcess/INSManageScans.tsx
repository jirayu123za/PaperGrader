import React from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Text, Alert, Anchor, FileInput, Box, Flex, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const INSManageScans: React.FC = () => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  return (
    <Container
      fluid
      py="xs"
      px="sm"
      style={{
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '25vh', // จำกัดความสูงไว้ที่ 1/4 ของจอ
      }}
    >
      <Flex justify="space-between" align="flex-start" style={{ width: '100%' }}>
        {/* Left Section */}
        <Box style={{ flex: 2, paddingRight: '0.5rem' }}>
          {/* Title */}
          <Title order={6} mb="xs" style={{ fontSize: '0.875rem' }}>
            Manage Scans
          </Title>

          {/* Warning Alert */}
          <Alert
            icon={<IconAlertCircle size={10} />}
            color="yellow"
            mb="xs"
            style={{ padding: '6px' }}
          >
            <Flex align="center">
              <Text style={{ fontSize: '0.625rem', fontWeight: 600, marginRight: '4px' }}>
                Proposed scan splits:
              </Text>
              <Text style={{ fontSize: '0.625rem' }}>
                Proposed scan splits will likely be more accurate if you first set up the{' '}
                <Anchor
                  href={`/courses/${course_id}/process/${assignment_id}/assignment-outline`}
                  style={{ textDecoration: 'underline', fontSize: '0.625rem' }}
                >
                  Assignment Outline
                </Anchor>
                .
              </Text>
            </Flex>
          </Alert>

          {/* Info Alert */}
          <Alert
            icon={<IconAlertCircle size={10} />}
            color="blue"
            mb="xs"
            style={{ padding: '6px' }}
          >
            <Flex align="center">
              <Text style={{ fontSize: '0.625rem', fontWeight: 600, marginRight: '4px' }}>
                Scanning tips:
              </Text>
              <Text style={{ fontSize: '0.625rem' }}>
                For more information on scanning best practices, see our{' '}
                <Anchor href="/scanning-tips" style={{ textDecoration: 'underline', fontSize: '0.625rem' }}>
                  scanning tips
                </Anchor>
                .
              </Text>
            </Flex>
          </Alert>

          {/* Descriptions */}
          <Text size="xs" mb="xs" style={{ fontSize: '0.625rem' }}>
            Upload scans in PDF format. A single file can contain multiple student submissions (it is
            more efficient to scan in batches). Multiple files can be uploaded at once.
          </Text>

          <Text size="xs" style={{ fontSize: '0.625rem' }}>
            PaperGrader attempts to split each uploaded scan into submissions. The proposed split depends
            on the length of the{' '}
            <Anchor
              href={`/courses/${course_id}/process/${assignment_id}/question-outline`}
              style={{ textDecoration: 'underline', fontSize: '0.625rem' }}
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
            padding: '4px',
            borderRadius: '4px',
            textAlign: 'center',
            width: '120px',
            height: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text size="xs" color="dimmed" mb="xs" style={{ fontSize: '0.625rem' }}>
            Drop files anywhere on the page, or select files using the button below.
          </Text>
          <FileInput placeholder="Select PDF Files" accept=".pdf" size="xs" />
        </Box>
      </Flex>
    </Container>
  );
};

export default INSManageScans;
