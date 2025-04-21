import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import PDFViewer from '../../../../../components/PDFViewer';
import CreateOutline from '../../../../../components/INS/INSProcess/Right/Create';
import { useRouter } from 'next/router';
import { Container, Flex, Loader } from '@mantine/core';
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
<Container fluid style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', margin: 0, padding: 0, backgroundColor: 'transparent' }}>
  {/* Sidebar */}
  <LeftProcess />

  {/* Main Content - PDF Viewer */}
  <Flex
    style={{
      flex: 1, // ให้ PDFViewer ขยายเต็มพื้นที่
      overflow: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'margin-right 0.3s ease',
      backgroundColor: 'transparent', // ✅ กำหนดให้โปร่งใส
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
      width: form.values.isOutlineCollapsed ? '3%' : '30%', // ปรับขนาดได้
      overflowY: 'auto',
      borderLeft: form.values.isOutlineCollapsed ? 'none' : '1px solid transparent', // ✅ ปรับให้โปร่งใส
      transition: 'width 0.3s ease',
      backgroundColor: 'transparent', // ✅ ทำให้ไม่มีสีพื้นหลัง
      cursor: form.values.isOutlineCollapsed ? 'pointer' : 'default',
    }}
    onClick={() => form.setFieldValue('isOutlineCollapsed', false)} // เมื่อคลิกให้ขยายกลับ
  >
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
