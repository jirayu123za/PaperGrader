import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Flex, Loader } from '@mantine/core';

export default function CreateOutline() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (assignment_id && course_id) {
        try {
          const response = await axios.get('/api/api/instructor/template/url', {
            params: {
              course_id: course_id,
              assignment_id: assignment_id,
            },
          });
          setPdfUrl(response.data.url);
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPdfUrl();
  }, [assignment_id, course_id]);

  return (
    <Container
      fluid
      className="flex min-h-screen overflow-hidden"
      style={{ padding: 0 }}
    >
      {/* Sidebar */}
      <LeftProcess />

      {/* Main Content */}
      <Flex
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {loading ? (
          <Loader />
        ) : pdfUrl ? (
          <PDFViewer fileUrl={pdfUrl} />
        ) : (
          <div>No PDF available</div>
        )}
      </Flex>
    </Container>
  );
}