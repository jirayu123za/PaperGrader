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
        type: 'NAME' | 'STUDENTID' | 'QUESTION';
      }[],
    },
  });

  const handleNewQuestion = () => {
    const newBox = {
      topLeft: { x: 100, y: 100 },
      bottomRight: { x: 300, y: 200 },
      pageNumber: 1,
      title: 'New Question',
      points: 1,
      type: 'QUESTION',
    };

    const updatedBoxes = [...form.values.boundingBoxes, newBox];
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const handleEditName = () => {
    const existingIndex = form.values.boundingBoxes.findIndex((box) => box.type === 'NAME');
    let updatedBoxes;

    if (existingIndex !== -1) {
      // ถ้ามี BoundingBox ของ Name อยู่แล้ว ให้ลบออก
      updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
    } else {
      // ถ้ายังไม่มี ให้เพิ่ม BoundingBox ของ Name
      const newBox = {
        topLeft: { x: 50, y: 50 },
        bottomRight: { x: 200, y: 100 },
        pageNumber: 1,
        title: 'Name',
        points: 0,
        type: 'NAME',
      };
      updatedBoxes = [...form.values.boundingBoxes, newBox];
    }

    // อัปเดต form และ localStorage
    form.setFieldValue('boundingBoxes', updatedBoxes);
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const handleEditStudentID = () => {
    const existingIndex = form.values.boundingBoxes.findIndex((box) => box.type === 'STUDENTID');
    let updatedBoxes;

    if (existingIndex !== -1) {
      // ถ้ามี BoundingBox ของ Student ID อยู่แล้ว ให้ลบออก
      updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
    } else {
      // ถ้ายังไม่มี ให้เพิ่ม BoundingBox ของ Student ID
      const newBox = {
        topLeft: { x: 50, y: 150 },
        bottomRight: { x: 200, y: 200 },
        pageNumber: 1,
        title: 'Student ID',
        points: 0,
        type: 'STUDENTID',
      };
      updatedBoxes = [...form.values.boundingBoxes, newBox];
    }

    // อัปเดต form และ localStorage
    form.setFieldValue('boundingBoxes', updatedBoxes);
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };



  const updateBoundingBox = (index: number, newBox: any) => {
    const updatedBoxes = [...form.values.boundingBoxes];
    updatedBoxes[index] = newBox;
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const removeBoundingBox = (index: number) => {
    const updatedBoxes = form.values.boundingBoxes.filter((_, i) => i !== index);
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (assignment_id && course_id) {
        try {
          const response = await axios.get('/api/api/instructor/template/url', {
            params: { course_id, assignment_id },
          });
          form.setFieldValue('pdfUrl', response.data.url);
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
          alert('Failed to load PDF. Please try again.');
        } finally {
          form.setFieldValue('loading', false);
        }
      }
    };

    const loadBoundingBoxes = () => {
      const savedBoxes = localStorage.getItem(`boundingBoxes-${assignment_id}`);
      if (savedBoxes) {
        try {
          const parsedBoxes = JSON.parse(savedBoxes);
          if (Array.isArray(parsedBoxes)) {
            form.setFieldValue('boundingBoxes', parsedBoxes);
          }
        } catch (error) {
          console.error('Error parsing bounding box data:', error);
        }
      }
    };

    fetchPdfUrl();
    loadBoundingBoxes();
  }, [assignment_id, course_id]);

  return (
    <Container fluid className="flex min-h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
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
            assignmentId={assignment_id as string}
            boundingBoxes={form.values.boundingBoxes}
            updateBoundingBox={updateBoundingBox}
            setBoundingBoxes={(newBoxes) => form.setFieldValue('boundingBoxes', newBoxes)}
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
          onEditName={handleEditName}
          onEditStudentID={handleEditStudentID}
          boundingBoxes={form.values.boundingBoxes}
          removeBoundingBox={removeBoundingBox}
          updateBoundingBox={updateBoundingBox}
        />
      </Flex>
    </Container>
  );
}
