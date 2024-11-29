import React, { useState } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import SectionSelector from '../Create/Sections/SectionSelector'; // นำเข้า SectionSelector component

interface EditCourseMemberProps {
  isOpen: boolean;
  onClose: () => void;
  member: any; // Define member type if you have it
}

const EditCourseMember: React.FC<EditCourseMemberProps> = ({ isOpen, onClose, member }) => {
  const [selectedSections, setSelectedSections] = useState<string[]>(member?.sections || []);

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

        {/* ใช้ SectionSelector */}
        <SectionSelector
          setSections={setSelectedSections}
          defaultEnabled={true} // เปิดการเลือก Sections ตั้งแต่เริ่มต้น
        />

        <div className="flex justify-end mt-6">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="teal"
            className="ml-2"
            onClick={() => console.log('Selected Sections:', selectedSections)}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCourseMember;
