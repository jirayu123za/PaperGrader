import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Select } from '@mantine/core';
import SectionSelector from '../Create/Sections/SectionSelector';
import { useRosterStore } from '../../store/useRosterStore';
import { useSelectSectionStore } from '../../store/useSectionStore';

interface EditCourseMemberProps {
  isOpen: boolean;
  onClose: () => void;
  personal_data_id: string | null;
}

const EditCourseMember: React.FC<EditCourseMemberProps> = ({
  isOpen,
  onClose,
  personal_data_id,
}) => {
  const { usersList } = useRosterStore();
  const member = usersList.find((user) => user.personal_data_id === personal_data_id);
  const { selectedSections, setSelectedSections, resetSelectedSections } = useSelectSectionStore();
  const [fullName, setFullName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      setStudentCode(member.student_code || '');
      setRole(member.role_type || '');

      const sections = member.section_name
        ? member.section_name.includes(',')
          ? member.section_name.split(',')
          : [member.section_name]
        : ['All Sections'];
      setSelectedSections(sections);
    } else {
      setFullName('');
      setStudentCode('');
      setRole('');
      resetSelectedSections();
    }
  }, [member, setSelectedSections, resetSelectedSections]);

  const capitalizeWords = (value: string) => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSave = () => {
    const validatedName = capitalizeWords(fullName);

    const updatedMember = {
      personal_data_id,
      full_name: validatedName,
      student_code: studentCode,
      role_type: role,
      sections: selectedSections,
    };

    console.log('Saving member data:', updatedMember);

    onClose();
  };

  const isSectionDisabled = role === 'INSTRUCTOR' || role === 'TA';

  return (
    <Modal opened={isOpen} onClose={onClose} title="Edit Course Member">
      <div className="p-4">
        <p className="text-sm text-blue-600 mb-4">
          Edit roster information for this course member.
        </p>

        <TextInput
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={(e) => setFullName(capitalizeWords(e.target.value))}
        />

        <TextInput
          label="Email Address"
          required
          defaultValue={member?.email || ''}
          disabled
        />

        <TextInput
          label="Student ID"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
        />

        <Select
          label="Role"
          data={['INSTRUCTOR', 'STUDENT', 'TA']}
          value={role}
          onChange={(value) => {
            setRole(value || '');
            if (value === 'INSTRUCTOR' || value === 'TA') {
              resetSelectedSections();
            }
          }}
          required
        />

        {!isSectionDisabled && (
          <SectionSelector
            defaultEnabled={true}
          />
        )}

        <div className="flex justify-end mt-6">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="teal"
            className="ml-2"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCourseMember;
