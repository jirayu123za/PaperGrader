import React from 'react';
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
  } = useAssignmentStore();

  const { templateFile } = useFileStore();
  const { mutate } = useCreateAssignment();

  const handleCreateAssignment = () => {
    const assignmentData = {
      assignmentName,
      templateFile,
      uploadBy,
      releaseDate,
      dueDate,
      allowLateSubmission,
    };

    console.log('assignmentData:', assignmentData);

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
          value={assignmentName}
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
