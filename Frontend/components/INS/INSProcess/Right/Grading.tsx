import LeftProcess from '../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../PDFViewer';
import Grading from '../../../../components/INS/INSProcess/INSGrading';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Flex, Loader, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FaBars } from 'react-icons/fa';

export default function GradePage() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const [isGradeCollapsed, setGradeCollapsed] = useState(false);

  const form = useForm({
    initialValues: {
      pdfUrl: '',
      loading: true,
    },
  });

  useEffect(() => {
    const loadPdfFromPublic = () => {
      const pdfPath = '/pdf/test01.pdf';
      form.setFieldValue('pdfUrl', pdfPath);
      form.setFieldValue('loading', false);
    };

    loadPdfFromPublic();
  }, []);

  const rubricItems = [
    { id: 1, description: 'Question 1', points: 10, earnedPoints: 8 },
    { id: 2, description: 'Question 2', points: 15, earnedPoints: 12 },
    { id: 3, description: 'Question 3', points: 20, earnedPoints: 18 },
  ];

  return (
    <Container fluid className="flex min-h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <Flex
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '15%',
          borderRight: '1px solid #dee2e6',
          overflow: 'hidden',
        }}
      >
        <LeftProcess />
      </Flex>

      {/* Main Content */}
      <Flex
        style={{
          marginLeft: '15%',
          marginRight: isGradeCollapsed ? '0%' : '30%',
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'margin-right 0.3s ease',
        }}
      >
        {form.values.loading ? (
          <Loader />
        ) : form.values.pdfUrl ? (
          <PDFViewer
            fileUrl={form.values.pdfUrl}
            assignmentId={assignment_id as string}
            boundingBoxes={[]}
            updateBoundingBox={() => {}}
            setBoundingBoxes={() => {}}
          />
        ) : (
          <div>No PDF available</div>
        )}
      </Flex>

      {/* Grading Section */}
      <Flex
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: isGradeCollapsed ? '3%' : '30%',
          padding: isGradeCollapsed ? '0' : '1rem',
          overflowY: 'auto',
          borderLeft: '1px solid #dee2e6',
          transition: 'width 0.3s ease',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Button
          style={{
            position: 'absolute',
            top: '10px',
            right: isGradeCollapsed ? '5px' : 'calc(30% - 30px)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#6665AC',
            color: isGradeCollapsed ? '#FFF' : '#6665AC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setGradeCollapsed((prev) => !prev)}
        >
          <FaBars />
        </Button>
        {!isGradeCollapsed && <Grading rubricItems={rubricItems} />}
      </Flex>
    </Container>
  );
}
