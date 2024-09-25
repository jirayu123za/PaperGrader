import React, { useState } from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [uploadBy, setUploadBy] = useState('student');
  const [releaseDate, setReleaseDate] = useState<string>(''); 
  const [dueDate, setDueDate] = useState<string>(''); 
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);

  const handleCreateAssignment = () => {
   
    console.log({
      assignmentName,
      templateFile,
      uploadBy,
      releaseDate,
      dueDate,
      allowLateSubmission,
    });
    onClose(); 
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Create Assignment"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
      
    >
     
      <div>
        <TextInput
          label="Assignment Name"
          placeholder="Name your assignment"
          value={assignmentName}
          onChange={(event) => setAssignmentName(event.currentTarget.value)}
          required
        />


        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-500 mr-2">Please select a file</p>
          <Button
            onClick={() => document.getElementById('fileInput')?.click()}
            variant="default"
            size="xs" 
          >
            Select PDF
          </Button>
        </div>

        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(event) => {
            if (event.currentTarget.files) {
              setTemplateFile(event.currentTarget.files[0]);
            }
          }}
        />
        <p className="text-sm text-gray-500 mt-1">
          {templateFile ? `Selected file: ${templateFile.name}` : ''}
        </p>

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

        <Checkbox
          className="mt-4"
          label="Enable Group Submission"
        />

        <div className="flex justify-end mt-6"> 
          <Button
            onClick={handleCreateAssignment}
          >
            Create Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAssignmentModal;
