import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Container, Flex, Loader, TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function CreateOutline() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  // ใช้ useForm สำหรับจัดการ state
  const form = useForm({
    initialValues: {
      pdfUrl: '',
      loading: true,
    },
  });

  // Fetch PDF URL เมื่อ assignment_id และ course_id พร้อม
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
          form.setFieldValue('pdfUrl', response.data.url);
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
        } finally {
          form.setFieldValue('loading', false);
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
        {form.values.loading ? (
          <Loader />
        ) : form.values.pdfUrl ? (
          <PDFViewer fileUrl={form.values.pdfUrl} />
        ) : (
          <div>No PDF available</div>
        )}
      </Flex>
    </Container>
  );
}
