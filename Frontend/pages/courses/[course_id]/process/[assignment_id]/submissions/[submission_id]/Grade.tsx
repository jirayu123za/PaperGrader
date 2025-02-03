import React, { useEffect, useState } from 'react';
import { Container, Flex, Loader, Button } from '@mantine/core';
import { FaBars } from 'react-icons/fa';
import { useRouter } from 'next/router';
import LeftProcess from '../../../../../../../components/LeftINS/LeftProcess';
import Grading from '../../../../../../../components/INS/INSProcess/Right/Grading';
import GradePdfViewer from '../../../../../../../components/INS/GradePdfViewer';

// interface BoundingBox {
//   id: number;
//   questionId: string;
//   topLeft: { x: number; y: number };
//   bottomRight: { x: number; y: number };
//   pageNumber: number;
//   title: string;
//   points: number;
//   type: 'NAME' | 'STUDENTID' | 'QUESTION';
// }

export default function GradePage() {
  // const router = useRouter();
  // const { assignment_id, course_id } = router.query;
  // const [isOutlineCollapsed, setOutlineCollapsed] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);

  // const form = useForm({
  //   initialValues: {
  //     loading: true,
  //     boundingBoxes: [] as BoundingBox[],
  //   },
  // });

  // const handleNewQuestion = () => {
  //   const questionBoxes = form.values.boundingBoxes.filter((box) => box.type === 'QUESTION');
  //   const newBox: BoundingBox = {
  //     id: Date.now(),
  //     questionId: `Q${questionBoxes.length + 1}`,
  //     topLeft: { x: 100, y: 100 },
  //     bottomRight: { x: 300, y: 200 },
  //     pageNumber: currentPage,
  //     title: `Q${questionBoxes.length + 1}: New Question`,
  //     points: 1,
  //     type: 'QUESTION',
  //   };

  //   const updatedBoxes = [...form.values.boundingBoxes, newBox];
  //   form.setFieldValue('boundingBoxes', updatedBoxes);

  //   if (assignment_id) {
  //     localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
  //   }
  // };

  // const handleEditName = () => {
  //   const existingIndex = form.values.boundingBoxes.findIndex((box) => box.type === 'NAME');
  //   let updatedBoxes: BoundingBox[];

  //   if (existingIndex !== -1) {
  //     updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
  //   } else {
  //     const newBox: BoundingBox = {
  //       id: Date.now(),
  //       questionId: 'NAME',
  //       topLeft: { x: 50, y: 50 },
  //       bottomRight: { x: 200, y: 100 },
  //       pageNumber: currentPage,
  //       title: 'Name',
  //       points: 0,
  //       type: 'NAME',
  //     };
  //     updatedBoxes = [...form.values.boundingBoxes, newBox];
  //   }

  //   form.setFieldValue('boundingBoxes', updatedBoxes);

  //   if (assignment_id) {
  //     localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
  //   }
  // };

  // const handleEditStudentID = () => {
  //   const existingIndex = form.values.boundingBoxes.findIndex((box) => box.type === 'STUDENTID');
  //   let updatedBoxes: BoundingBox[];

  //   if (existingIndex !== -1) {
  //     updatedBoxes = form.values.boundingBoxes.filter((_, index) => index !== existingIndex);
  //   } else {
  //     const newBox: BoundingBox = {
  //       id: Date.now(),
  //       questionId: 'STUDENTID',
  //       topLeft: { x: 50, y: 150 },
  //       bottomRight: { x: 200, y: 200 },
  //       pageNumber: currentPage,
  //       title: 'Student ID',
  //       points: 0,
  //       type: 'STUDENTID',
  //     };
  //     updatedBoxes = [...form.values.boundingBoxes, newBox];
  //   }

  //   form.setFieldValue('boundingBoxes', updatedBoxes);

  //   if (assignment_id) {
  //     localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
  //   }
  // };

  // const updateBoundingBox = (index: number, newBox: BoundingBox) => {
  //   const updatedBoxes = [...form.values.boundingBoxes];
  //   updatedBoxes[index] = newBox;
  //   form.setFieldValue('boundingBoxes', updatedBoxes);

  //   if (assignment_id) {
  //     localStorage.setItem(`boundingBoxes-${assignment_id}`, JSON.stringify(updatedBoxes));
  //   }
  // };

  // useEffect(() => {
  //   const loadBoundingBoxes = () => {
  //     const savedBoxes = localStorage.getItem(`boundingBoxes-${assignment_id}`);
  //     if (savedBoxes) {
  //       try {
  //         const parsedBoxes: BoundingBox[] = JSON.parse(savedBoxes);
  //         if (Array.isArray(parsedBoxes)) {
  //           form.setFieldValue('boundingBoxes', parsedBoxes);
  //         }
  //       } catch (error) {
  //         console.error('Error parsing bounding box data:', error);
  //       }
  //     }
  //   };
  //   loadBoundingBoxes();
  // }, [assignment_id, course_id]);

  return (
    <Container fluid className="flex min-h-screen overflow-hidden">
      {/* Left sidebar */}
      <LeftProcess />

      {/* Main Content */}
      <Flex
        style={{
          // marginLeft: '15%',
          // marginRight: isOutlineCollapsed ? '0%' : '30%',
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'margin-right 0.3s ease',
        }}
      >
        <GradePdfViewer
          // boundingBoxes={form.values.boundingBoxes}
          // currentPage={currentPage}
          // setCurrentPage={setCurrentPage}
        />
      </Flex>

      {/* CreateOutline Section */}
      {/* <Flex
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
      >
        <Button
          style={{
            position: 'absolute',
            top: '10px',
            right: isOutlineCollapsed ? '5px' : 'calc(30% - 30px)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#6665AC',
            color: isOutlineCollapsed ? '#FFF' : '#6665AC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setOutlineCollapsed((prev) => !prev)}
        >
          <FaBars />
        </Button>
      </Flex> */}

      <Grading 
        // onNewQuestion={handleNewQuestion}
        // onEditName={handleEditName}
        // onEditStudentID={handleEditStudentID}
        // boundingBoxes={form.values.boundingBoxes}
        // removeBoundingBox={() => {}}
        // updateBoundingBox={updateBoundingBox}
        // onToggleCollapse={() => setOutlineCollapsed((prev) => !prev)}
      />
    </Container>
  );
}
