import React, { useState } from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useCreateAssignment } from '../hooks/useCreateAssignment';
import UploadFile from './UploadFile';
import { useFileStore } from '../store/FileStore';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import '@mantine/dates/styles.css';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const {
    assignment_name,
    setAssignmentName,
    submiss_by,
    setUploadBy,
    release_date,
    setReleaseDate,
    due_date,
    setDueDate,
    group_submiss,
    setGroupSubmiss,
    setAllowLateSubmission,
    late_submiss,
    cut_off_date,
    setCutOffDate,
  } = useAssignmentStore();

  const { templateFile } = useFileStore();
  const { mutate } = useCreateAssignment();

  const handleCreateAssignment = () => {
    const assignmentData = {
      assignment_name,
      //templateFile,
      submiss_by,
      release_date: release_date ? dayjs(release_date).format("DD-MM-YYYY") : '',
      due_date: due_date ? dayjs(due_date).format("DD-MM-YYYY") : '',              
      group_submiss,
      late_submiss,
      cut_off_date: late_submiss && cut_off_date ? dayjs(cut_off_date).format("DD-MM-YYYY") : '',  
    };

    //console.log('assignmentData:', assignmentData);

    mutate(assignmentData, {
      onSuccess: () => {
        console.log('Assignment created successfully');
        onClose();
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
      <div className="p-4">
        <TextInput
          label="Assignment Name"
          placeholder="Name your assignment"
          value={assignment_name}
          onChange={(event) => setAssignmentName(event.currentTarget.value)}
          required
          className="mb-4"
        />
        {/* ส่วนสำหรับการอัพโหลดไฟล์ */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-700">Upload File</p>
          <UploadFile />
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Who will upload submissions?</p>
          <RadioGroup value={submiss_by} onChange={setUploadBy} required>
            <div className="flex justify-start gap-8">
              <Radio value="instructor" label="Instructor" />
              <Radio value="student" label="Student" />
            </div>
          </RadioGroup>
        </div>

        {/* DatePickerInput สำหรับ Release Date และ Due Date */}
        <div className="flex justify-between mt-4 mb-4 gap-4">
          <div className="w-full">
            <DatePickerInput
              label="Release Date"
              placeholder="Select release date"
              value={release_date ? new Date(release_date) : null}
              onChange={(date) => {
                setReleaseDate(date ? dayjs(date).toDate() : null);
                setDueDate(null); // รีเซ็ต Due Date เมื่อมีการเปลี่ยน Release Date
                setCutOffDate(null); // รีเซ็ต Cut off Date เมื่อมีการเปลี่ยน Release Date
              }}
              valueFormat="DD/MM/YYYY"
              required
            />
          </div>
          <div className="w-full">
            <DatePickerInput
              label="Due Date"
              placeholder="Select due date"
              value={due_date ? new Date(due_date) : null}
              minDate={release_date ? new Date(release_date) : undefined}  // กำหนด minDate เป็น Release Date
              onChange={(date) => {
                setDueDate(date ? dayjs(date).toDate() : null);
                setCutOffDate(null); // รีเซ็ต Cut off Date เมื่อ Due Date เปลี่ยน
              }}
              valueFormat="DD/MM/YYYY"
              required
            />
          </div>
        </div>

        <Checkbox
          label="Allow late submissions"
          checked={late_submiss}
          onChange={(event) => setAllowLateSubmission(event.currentTarget.checked)}
          className="mb-1"
        />
        <Checkbox
          label="Allow group submissions"
          checked={group_submiss}
          onChange={(event) => setGroupSubmiss(event.currentTarget.checked)}
        />

        {/* แสดง Cut off Date ถ้ามีการเลือก Allow late submissions */}
        {late_submiss && (
          <DatePickerInput
            label="Cut off Date"
            placeholder="Select cut off date"
            value={cut_off_date ? new Date(cut_off_date) : null}
            minDate={due_date ? new Date(due_date) : undefined}  // กำหนด minDate เป็น Due Date
            onChange={(date) => setCutOffDate(date ? dayjs(date).toDate() : null)}
            valueFormat="DD/MM/YYYY"
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
