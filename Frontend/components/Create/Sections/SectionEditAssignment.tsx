import React, { useEffect } from 'react';
import { TagsInput, Text, Loader } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useSelectSectionStore } from '../../../store/useSectionStore';

interface SectionEditAssignmentProps {
  assignmentId: string;
}

const SectionEditAssignment: React.FC<SectionEditAssignmentProps> = ({ assignmentId }) => {
  const { data: sections, isLoading, error } = useFetchAssignmentSections(assignmentId);
  const { selectedSections, setSelectedSections } = useSelectSectionStore();

  // เมื่อ sections มีการเปลี่ยนแปลง ให้กรองและแมป section_id กับ section_name
  const selectedTagsData = sections
    ? sections
        .filter((section) => selectedSections.includes(section.section_id))
        .map((section) => ({
          label: section.section_name,
          value: section.section_id,
        }))
    : [];

  const allTagsData = sections
    ? sections.map((section) => ({
        label: section.section_name,
        value: section.section_id,
      }))
    : [];

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div className="mt-4">
      <TagsInput
        data={allTagsData} // ใช้ sections ทั้งหมดใน dropdown
        placeholder="Add or select sections"
        value={selectedTagsData.map((tag) => tag.value)} // แสดงแท็กที่เลือก
        onChange={(tags) => setSelectedSections(tags)} // อัปเดต selectedSections ใน store
        label="Edit Sections"
        maxDropdownHeight={100}
        comboboxProps={{ shadow: 'md' }}
        clearable
        required
        splitChars={[' ', ',', '\n']}
      />
    </div>
  );
};

export default SectionEditAssignment;
