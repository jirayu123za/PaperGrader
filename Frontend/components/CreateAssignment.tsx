import React, { useState } from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useCreateAssignment } from '../hooks/useCreateAssignment';
import UploadFile from './UploadFile';
import { useFileStore } from '../store/FileStore';

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
      release_date,
      due_date,
      group_submiss,
      late_submiss,
      cut_off_date: late_submiss ? cut_off_date : '',
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
        <div className="flex justify-between mt-4 mb-4 gap-4">
          <div className="w-full">
            <TextInput
              label="Release Date (EDT)"
              placeholder="Select release date"
              type="date"
              value={release_date}
              onChange={(event) => setReleaseDate(event.currentTarget.value)}
              required
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Due Date (EDT)"
              placeholder="Select due date"
              type="date"
              value={due_date}
              onChange={(event) => setDueDate(event.currentTarget.value)}
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
          <TextInput
            label="Cut off Date"
            placeholder="Select cut off date"
            type="date"
            value={cut_off_date}
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
