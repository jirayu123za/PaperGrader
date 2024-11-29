import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import SectionSelector from '../Create/Sections/SectionSelector';
import { useRosterStore } from '../../store/useRosterStore';
import { useSectionsListStore, useSelectSectionStore } from '../../store/useSectionStore';

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
  const { selectedSections, setSelectedSections, resetSelectedSections } = useSelectSectionStore();

  // ดึงข้อมูลของผู้ใช้ที่ต้องการแก้ไข
  const member = usersList.find((user) => user.personal_data_id === personal_data_id);

  // ตั้งค่าข้อมูลเริ่มต้น
  const [fullName, setFullName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      setStudentCode(member.student_code || '');
      setSelectedSections([member.section_name || '']);
    } else {
      setFullName('');
      setStudentCode('');
      resetSelectedSections();
    }
  }, [member, setSelectedSections, resetSelectedSections]);

  const handleSave = () => {
    const updatedMember = {
      personal_data_id,
      full_name: fullName,
      student_code: studentCode,
      sections: selectedSections,
    };

    console.log('Saving member data:', updatedMember);

    // เพิ่มฟังก์ชันสำหรับการบันทึกข้อมูล เช่น การเรียก API
    onClose();
  };

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

        <SectionSelector
          setSections={setSelectedSections}
          defaultEnabled={true}
        />

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
