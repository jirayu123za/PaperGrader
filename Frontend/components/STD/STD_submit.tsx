import React from 'react';
import { Modal, Button, FileInput, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDownload, IconFileText } from '@tabler/icons-react';
import { useFetchInstructorFile } from '../../hooks/useFetchInstructorFile'; // Correct hook import
import { useUploadStudentFile } from '../../hooks/useUploadStudentFile'; // Import from the correct file
import { useFileStore } from '../../store/useSTDFileStore'; // Zustand store

interface STDSubmitProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  courseId: string;  // Add courseId as a prop
}

const STDSubmit: React.FC<STDSubmitProps> = ({ isOpen, onClose, assignmentId, courseId }) => {
  // ดึงข้อมูลไฟล์ของอาจารย์
  const { data: instructorFile, isLoading } = useFetchInstructorFile(courseId, assignmentId);
  // ใช้ hook สำหรับอัปโหลดไฟล์
  const { mutate: uploadStudentFile } = useUploadStudentFile(); 
  // จัดการไฟล์ที่นักศึกษาเลือกผ่าน Zustand
  const { studentFile, setStudentFile } = useFileStore(); 

  const form = useForm({
    initialValues: {
      file: null,
    },
    validate: {
      file: (value) => (value ? null : 'You must upload a PDF'),
    },
  });

  // ฟังก์ชันบังคับดาวน์โหลดไฟล์
  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // ลบลิงก์หลังจากดาวน์โหลดเสร็จสิ้น
  };

  // ฟังก์ชัน handleSubmit สำหรับอัปโหลดไฟล์นักศึกษา
  const handleSubmit = () => {
    if (studentFile) {
      uploadStudentFile({ assignmentId, file: studentFile });
      handleClose(); // ปิด modal และรีเซ็ตข้อมูลหลังจากอัปโหลดสำเร็จ
    }
  };

  // ฟังก์ชันปิด modal และรีเซ็ตค่าในฟอร์ม
  const handleClose = () => {
    form.reset(); // รีเซ็ตฟอร์ม
    setStudentFile(null); // รีเซ็ตไฟล์นักศึกษา
    onClose(); // ปิด modal
  };

  return (
    <Modal opened={isOpen} onClose={handleClose} title="Submit Homework Assignment" size="lg">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* ตรวจสอบว่าไฟล์จากอาจารย์มีอยู่จริง และแสดงชื่อไฟล์พร้อมปุ่มดาวน์โหลด */}
          {instructorFile && instructorFile.files && instructorFile.fileNames ? (
            <Alert title="Your Instructor has provided PDF files to help you complete your assignment" color="blue" radius="md">
              {/* แสดงรายการไฟล์ทั้งหมด */}
              {instructorFile.files.map((fileUrl: string, index: number) => (
                <div key={index}>
                  <Button
                    variant="light"
                    onClick={() => downloadFile(fileUrl, instructorFile.fileNames[index])} 
                    className="text-blue-500 hover:underline block"
                  >
                    <IconDownload size={18} className="inline-block mr-2" />
                    {instructorFile.fileNames[index]}
                  </Button>
                </div>
              ))}
            </Alert>
          ) : (
            <Alert icon={<IconFileText size={16} />} title="No file available" color="red" radius="md">
              No file uploaded by the instructor.
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <div className="my-4">
              <FileInput
                placeholder="Select PDF"
                label="Upload a PDF containing your responses to the assignment."
                value={studentFile}
                onChange={setStudentFile}
                accept="application/pdf"
                required
              />
            </div>

            {studentFile && (
              <div className="mb-4">
                <IconFileText className="inline-block mr-2" />
                {studentFile.name}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="default" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="blue" className="ml-2">
                Upload PDF
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};

export default STDSubmit;
