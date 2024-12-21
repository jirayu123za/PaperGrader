import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import CreateOutline from '../../../../../components/INS/INSProcess/Right/CreateOutline';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Container, Flex, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function CreateOutlinePage() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const form = useForm({
    initialValues: {
      pdfUrl: '',
      loading: true,
      boundingBoxes: [] as {
        topLeft: { x: number; y: number };
        bottomRight: { x: number; y: number };
        pageNumber: number;
        title: string;
        points: number;
      
      }[],

    },
  });

  const handleNewQuestion = () => {
    form.setFieldValue('boundingBoxes', [
      ...form.values.boundingBoxes,
      {
        topLeft: { x: 100, y: 100 },
        bottomRight: { x: 300, y: 200 },
        pageNumber: 1,
        title: 'New Question',
        points: 1,
      },
    ]);
  };

  const updateBoundingBox = (index: number, newBox: any) => {
    const updatedBoxes = [...form.values.boundingBoxes];
    updatedBoxes[index] = newBox;
    form.setFieldValue('boundingBoxes', updatedBoxes);
  };

  const removeBoundingBox = (index: number) => {
    const updatedBoxes = form.values.boundingBoxes.filter((_, i) => i !== index);
    form.setFieldValue('boundingBoxes', updatedBoxes);
  };

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (assignment_id && course_id) {
        try {
          const response = await axios.get('/api/api/instructor/template/url', {
            params: {
              course_id,
              assignment_id,
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
      className="flex min-h-screen overflow-hidden "
      style={{ margin: 0, padding: 0 }}
    >
      {/* Sidebar */}
      <Flex
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '20%',
          borderRight: '1px solid #dee2e6',
          overflow: 'hidden',
          padding: 0,
          margin: 0,
        }}
      >
        <LeftProcess />
      </Flex>

      {/* Main Content */}
      <Flex
        style={{
          marginLeft: '20%',
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
          <PDFViewer
            fileUrl={form.values.pdfUrl}
            boundingBoxes={form.values.boundingBoxes}
            updateBoundingBox={updateBoundingBox}

          />
        ) : (
          <div>No PDF available</div>
        )}
      </Flex>

      {/* CreateOutline Section */}
      <Flex
        style={{
          width: '30%',
          padding: '1rem',
          overflow: 'hidden',
          borderLeft: '1px solid #dee2e6',
        }}
      >
        <CreateOutline
          onNewQuestion={handleNewQuestion}
          boundingBoxes={form.values.boundingBoxes}
          removeBoundingBox={removeBoundingBox}
          updateBoundingBox={updateBoundingBox} // เพิ่มการส่ง prop นี้
        />

      </Flex>
    </Container>
  );
}
