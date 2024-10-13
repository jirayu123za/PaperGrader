import React, { useState, useEffect } from 'react';
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
}

const STDSubmit: React.FC<STDSubmitProps> = ({ isOpen, onClose, assignmentId }) => {
  const { data: instructorFile, isLoading } = useFetchInstructorFile(assignmentId);
  const { mutate: uploadStudentFile } = useUploadStudentFile(); // Correctly imported hook
  const { studentFile, setStudentFile } = useFileStore(); // Zustand state

  const form = useForm({
    initialValues: {
      file: null,
    },
    validate: {
      file: (value) => (value ? null : 'You must upload a PDF'),
    },
  });

  // ฟังก์ชัน handleSubmit สำหรับอัปโหลดไฟล์
  const handleSubmit = () => {
    if (studentFile) {
      uploadStudentFile({ assignmentId, file: studentFile });
      handleClose(); // เมื่ออัปโหลดไฟล์เสร็จแล้ว ให้ปิด modal และรีเซ็ตข้อมูล
    }
  };

  // ฟังก์ชัน handleClose สำหรับปิด Modal และรีเซ็ตข้อมูล
  const handleClose = () => {
    form.reset(); // รีเซ็ตฟอร์ม
    setStudentFile(null); // รีเซ็ตไฟล์ของนักเรียนใน Zustand store
    onClose(); // ปิด Modal
  };

  return (
    <Modal opened={isOpen} onClose={handleClose} title="Submit Homework Assignment" size="lg">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* ตรวจสอบว่าไฟล์ของผู้สอนมีอยู่จริงและแสดงชื่อไฟล์พร้อมลิงก์ดาวน์โหลด */}
          {instructorFile && instructorFile.fileUrl && instructorFile.fileName ? (
            <Alert  title="Your Instructor has provided a PDF to help you complete your assignment" color="blue" radius="md">
              <a href={instructorFile.fileUrl} download={instructorFile.fileName} className="text-blue-500 hover:underline">
                <IconDownload size={18} className="inline-block mr-2" />
                {instructorFile.fileName} {/* แสดงชื่อไฟล์ที่ดึงมาจาก API */}
              </a>
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
