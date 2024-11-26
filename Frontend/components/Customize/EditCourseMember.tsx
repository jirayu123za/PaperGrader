import React from 'react';
import { Modal, Button, TextInput, Select } from '@mantine/core';

interface EditCourseMemberProps {
  isOpen: boolean;
  onClose: () => void;
  member: any; // Define member type if you have it
}

const EditCourseMember: React.FC<EditCourseMemberProps> = ({ isOpen, onClose, member }) => {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Edit Course Member">
      <div className="p-4">
        <p className="text-sm text-blue-600 mb-4">
          Edit roster information for this course member.
        </p>

        <TextInput
          label="Full Name"
          required
          defaultValue={member?.full_name || ''}
        />

        <TextInput
          label="Email Address"
          required
          defaultValue={member?.email || ''}
          disabled
        />

        <TextInput
          label="Student ID"
          defaultValue={member?.student_code || ''}
        />

        <Select
          label="Sections"
          placeholder="Select Sections..."
          data={['Section A', 'Section B', 'Section C']} // Replace with your dynamic data
        />

        <div className="flex justify-end mt-6">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" color="teal" className="ml-2">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCourseMember;
