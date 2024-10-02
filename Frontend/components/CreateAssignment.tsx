import React, { useState } from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useAssignmentStore } from '../store/AssignmentStore'; // นำเข้า Zustand store
import { useCreateAssignment } from '../hooks/useCreateAssignment'; // นำเข้า Custom Hook
import UploadFile from './UploadFile'; // นำเข้า UploadFile component
import { useFileStore } from '../store/FileStore'; // นำเข้า useFileStore สำหรับจัดการไฟล์

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const {
    assignmentName,
    setAssignmentName,
    uploadBy,
    setUploadBy,
    releaseDate,
    setReleaseDate,
    dueDate,
    setDueDate,
    allowLateSubmission,
    setAllowLateSubmission,
    cutOffDate,
    setCutOffDate, // ใช้ setter ของ cutOffDate
  } = useAssignmentStore(); // ดึง state และ functions จาก Zustand store

  const { templateFile } = useFileStore(); // ใช้ useFileStore สำหรับจัดการ state ของไฟล์
  const { mutate } = useCreateAssignment(); // ใช้ custom hook สำหรับการสร้าง assignment

  const handleCreateAssignment = () => {
    const assignmentData = {
      assignmentName,
      templateFile,
      uploadBy,
      releaseDate,
      dueDate,
      allowLateSubmission,
      cutOffDate: allowLateSubmission ? cutOffDate : '', // ส่ง cutOffDate เมื่ออนุญาตให้ส่งล่าช้า
    };

    // เรียกใช้ mutation เพื่อสร้าง assignment ใหม่
    mutate(assignmentData, {
      onSuccess: () => {
        console.log('Assignment created successfully');
        onClose(); // ปิด modal หลังจากสร้างสำเร็จ
      },
      onError: (error) => {
        console.error('Error creating assignment:', error);
      },
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Create Assignment"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <div className="p-4"> {/* เพิ่ม padding รอบๆ เนื้อหา */}
        <TextInput
          label="Assignment Name"
          placeholder="Name your assignment"
          value={assignmentName}
          onChange={(event) => setAssignmentName(event.currentTarget.value)}
          required
          className="mb-4" // เพิ่มระยะห่างด้านล่าง
        />
        {/* ส่วนสำหรับการอัพโหลดไฟล์ */}
        <div className="flex items-center justify-between mb-4"> {/* ใช้ flex เพื่อจัดแนวให้ตรง */}
          <p className="text-sm text-gray-700">Upload File</p> {/* ข้อความ Upload File อยู่ด้านซ้าย */}
          <UploadFile /> {/* ปุ่ม Select PDF อยู่ด้านขวา */}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Who will upload submissions?</p>
          <RadioGroup value={uploadBy} onChange={setUploadBy} required>
            <div className="flex justify-start gap-8">
              <Radio value="instructor" label="Instructor" />
              <Radio value="student" label="Student" />
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-between mt-4 gap-4">
          <div className="w-full">
            <TextInput
              label="Release Date (EDT)"
              placeholder="Select release date"
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.currentTarget.value)}
              required
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Due Date (EDT)"
              placeholder="Select due date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.currentTarget.value)}
              required
            />
          </div>
        </div>
        <Checkbox
          className="mt-4"
          label="Allow late submissions"
          checked={allowLateSubmission}
          onChange={(event) => setAllowLateSubmission(event.currentTarget.checked)}
        />
        {/* แสดง Cut off Date ถ้ามีการเลือก Allow late submissions */}
        {allowLateSubmission && (
          <TextInput
            label="Cut off Date"
            placeholder="Select cut off date"
            type="date"
            value={cutOffDate}
            onChange={(event) => setCutOffDate(event.currentTarget.value)}
            className="mt-4"
          />
        )}
        <div className="flex justify-end mt-6">
          <Button onClick={handleCreateAssignment}>
            Create Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAssignmentModal;
