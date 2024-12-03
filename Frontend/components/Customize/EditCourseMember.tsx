import React from 'react';
import { Modal, Button, TextInput, Select, Skeleton } from '@mantine/core';
import SectionSelector from '../Create/Sections/SectionSelector';
import { useEditCourseMemberStore, useEditCourseMemberFormStore } from '../../store/useEditCourseMemberStore';
import { useSelectSectionStore } from '../../store/useSectionStore';
import { useFetchEditCourseMember } from '../../hooks/Roster/useFetchEditCourseMember';

interface EditCourseMemberProps {
  isOpen: boolean;
  onClose: () => void;
  course_id: string;
  personal_data_id: string;
}

const EditCourseMember: React.FC<EditCourseMemberProps> = ({
  isOpen,
  onClose,
  course_id,
  personal_data_id,
}) => {
  const { editMember } = useEditCourseMemberStore();
  const { fullName, studentCode, role, setFullName, setStudentCode, setRole, resetForm } =
    useEditCourseMemberFormStore();
  const { selectedSections, setSelectedSections, resetSelectedSections } = useSelectSectionStore();

  const { isLoading, isSuccess } = useFetchEditCourseMember(course_id, personal_data_id);

  if (isOpen && isSuccess && editMember) {
    if (fullName === '' && studentCode === '' && role === '') {
      // อัปเดตค่าฟอร์มเมื่อข้อมูลพร้อมและฟิลด์ยังไม่ได้ตั้งค่า
      setFullName(editMember.full_name || '');
      setStudentCode(editMember.student_code || '');
      setRole(editMember.role_type || '');

      const sections = editMember.section_name
        ? editMember.section_name.includes(',')
          ? editMember.section_name.split(',')
          : [editMember.section_name]
        : ['All Sections'];
      setSelectedSections(sections);
    }
  }

  const handleSave = () => {
    const updatedMember = {
      personal_data_id,
      full_name: fullName,
      student_code: studentCode,
      role_type: role,
      sections: selectedSections,
    };

    console.log('Saving member data:', updatedMember);
    resetForm();
    resetSelectedSections();
    onClose();
  };

  const isSectionDisabled = role === 'INSTRUCTOR' || role === 'TA';

  return (
    <Modal
      opened={isOpen}
      onClose={() => {
        resetForm();
        resetSelectedSections();
        onClose();
      }}
      title="Edit Course Member"
    >
      <div className="p-4">
        {/* Skeleton loading */}
        <Skeleton visible={isLoading}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <TextInput label="Email Address" value={editMember?.email || ''} disabled />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <TextInput
            label="Student ID"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
          />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <Select
            label="Role"
            data={['INSTRUCTOR', 'STUDENT', 'TA']}
            value={role}
            onChange={(value) => {
              setRole(value || '');
              if (value === 'INSTRUCTOR' || value === 'TA') resetSelectedSections();
            }}
            required
          />
        </Skeleton>
        {!isSectionDisabled && (
          <Skeleton visible={isLoading}>
            <SectionSelector defaultEnabled={true} />
          </Skeleton>
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            onClick={() => {
              resetForm();
              resetSelectedSections();
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="filled" color="teal" className="ml-2" onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCourseMember;
