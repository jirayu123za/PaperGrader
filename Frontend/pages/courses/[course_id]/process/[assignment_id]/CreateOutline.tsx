import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import CreateOutline from '../../../../../components/INS/INSProcess/Right/Create';
import { useRouter } from 'next/router';
import { Container, Flex, Loader, Button } from '@mantine/core';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { useForm } from '@mantine/form';

export default function CreateOutlinePage() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;

  const form = useForm({
    initialValues: {
      isOutlineCollapsed: false,
      currentPage: 1,
    },
  });

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
          marginRight: form.values.isOutlineCollapsed ? '5%' : '30%',
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'margin-right 0.3s ease',
        }}
      >
        {assignment_id && course_id ? (
          <PDFViewer
            courseId={course_id as string}
            assignmentId={assignment_id as string}
          />
        ) : (
          <Loader />
        )}
      </Flex>

      {/* CreateOutline Section */}
      <Flex
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: form.values.isOutlineCollapsed ? '5%' : '30%',
          padding: form.values.isOutlineCollapsed ? '0' : '1rem',
          overflowY: 'auto',
          borderLeft: '1px solid #dee2e6',
          transition: 'width 0.3s ease',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Button
          style={{
            position: 'absolute', // ใช้ absolute เพื่อตรึงปุ่ม
            top: '10px',
            right: form.values.isOutlineCollapsed ? '20px' : '50px', // ตำแหน่งคงที่ไม่ให้กระทบ PDFViewer
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#6665AC',
            color: form.values.isOutlineCollapsed ? '#FFF': '#6665AC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            transition: 'right 0.3s ease', // เพิ่มการลื่นไหลของการเปลี่ยนตำแหน่ง
          }}
          onClick={() => form.setFieldValue('isOutlineCollapsed', !form.values.isOutlineCollapsed)}
        >
          <FaRegArrowAltCircleLeft
            style={{
              transform: form.values.isOutlineCollapsed ? 'rotate(0)' : 'rotate(180deg)', // หมุนไอคอนตามสถานะ
              transition: 'transform 0.3s ease', // เพิ่ม transition ให้กับการหมุน
            }}
          />
        </Button>

        {!form.values.isOutlineCollapsed && (
          <CreateOutline
            currentPage={form.values.currentPage}
            onToggleCollapse={() => form.setFieldValue('isOutlineCollapsed', !form.values.isOutlineCollapsed)}
          />
        )}
      </Flex>
    </Container>
  );
}
