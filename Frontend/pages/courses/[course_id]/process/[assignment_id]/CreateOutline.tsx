import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import CreateOutline from '../../../../../components/INS/INSProcess/Right/CreateOutline';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Flex, Loader, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FaBars } from 'react-icons/fa';

interface BoundingBox {
  id: number; // Unique ID
  questionId: string; // Question Identifier
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
  subQuestions?: SubQuestion[];
}
interface SubQuestion {
  title: string;
  points: number;
}

export default function CreateOutlinePage() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const [isOutlineCollapsed, setOutlineCollapsed] = useState(false);

  const form = useForm({
    initialValues: {
      pdfUrl: '',
      loading: true,
      boundingBoxes: [] as BoundingBox[],
    },
  });

  const handleNewQuestion = () => {
    const questionBoxes = form.values.boundingBoxes.filter((box) => box.type === 'QUESTION');
    const newBox: BoundingBox = {
      id: Date.now(), // ใช้ timestamp เป็น unique ID
      questionId: `Q${questionBoxes.length + 1}`, // เชื่อมกับ question
      topLeft: { x: 100, y: 100 },
      bottomRight: { x: 300, y: 200 },
      pageNumber: 1,
      title: `Q${questionBoxes.length + 1}: New Question`,
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
    let updatedBoxes: BoundingBox[];
  
    if (existingIndex !== -1) {
      updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
    } else {
      const newBox: BoundingBox = {
        id: Date.now(), // Assign unique ID
        questionId: 'Name', // Descriptive identifier
        topLeft: { x: 50, y: 50 },
        bottomRight: { x: 200, y: 100 },
        pageNumber: 1,
        title: 'Name',
        points: 0,
        type: 'NAME',
      };
      updatedBoxes = [...form.values.boundingBoxes, newBox];
    }
  
    form.setFieldValue('boundingBoxes', updatedBoxes);
  
    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };
  

  const handleEditStudentID = () => {
    const existingIndex = form.values.boundingBoxes.findIndex((box) => box.type === 'STUDENTID');
    let updatedBoxes: BoundingBox[];

    if (existingIndex !== -1) {
      updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
    } else {
      const newBox: BoundingBox = {
        id: Date.now(), // Assign a unique ID
        questionId: 'STUDENTID', // Use a descriptive identifier
        topLeft: { x: 50, y: 150 },
        bottomRight: { x: 200, y: 200 },
        pageNumber: 1,
        title: 'Student ID',
        points: 0,
        type: 'STUDENTID',
      };
      updatedBoxes = [...form.values.boundingBoxes, newBox];
    }

    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
    }
  };

  const updateBoundingBox = (index: number, newBox: BoundingBox) => {
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
          const parsedBoxes: BoundingBox[] = JSON.parse(savedBoxes);
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
          marginRight: isOutlineCollapsed ? '0%' : '30%',
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
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: isOutlineCollapsed ? '3%' : '30%',
          padding: isOutlineCollapsed ? '0' : '1rem',
          overflowY: 'auto',
          borderLeft: '1px solid #dee2e6',
          transition: 'width 0.3s ease',
          backgroundColor: '#f8f9fa',
        }}
      >  <Button
        style={{
          position: 'absolute',
          top: '10px', // อยู่ใกล้ขอบด้านบน
          right: isOutlineCollapsed ? '5px' : 'calc(30% - 30px)', // อยู่ตรงกลางของส่วนขวา
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#6665AC',
          color: isOutlineCollapsed ? '#FFF' : '#6665AC',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000, // เพื่อให้แสดงอยู่ด้านหน้าสุด
        }}
        onClick={() => setOutlineCollapsed((prev) => !prev)}
      >
          <FaBars />
        </Button>
        {!isOutlineCollapsed && (
          <CreateOutline
            onNewQuestion={handleNewQuestion}
            onEditName={handleEditName}
            onEditStudentID={handleEditStudentID}
            boundingBoxes={form.values.boundingBoxes}
            removeBoundingBox={removeBoundingBox}
            updateBoundingBox={updateBoundingBox}
            onToggleCollapse={() => setOutlineCollapsed((prev) => !prev)} // Callback for collapsing
          />
        )}
      </Flex>

    </Container>
  );
}
