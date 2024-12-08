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

  // Map `selectedSections` เป็น `section_name`
  const selectedTags = sections
    ? sections
        .filter((section) => selectedSections.includes(section.section_id))
        .map((section) => section.section_name) // ใช้ section_name สำหรับแสดงในแท็ก
    : [];

  const allTagsData = sections
    ? sections.map((section) => ({
        label: section.section_name,
        value: section.section_id,
      }))
    : [];

  const handleTagsChange = (tags: string[]) => {
    // หา section_id ที่ตรงกับ section_name ใน tags
    const updatedSelectedSections = sections
      ? sections
          .filter((section) => tags.includes(section.section_name)) // ใช้ section_name ตรงนี้
          .map((section) => section.section_id)
      : [];
    setSelectedSections(updatedSelectedSections);
  };

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div className="mt-4">
      <TagsInput
        data={allTagsData} // sections ทั้งหมดใน dropdown
        placeholder="Add or select sections"
        value={selectedTags} // แสดง `section_name` ในแท็ก
        onChange={handleTagsChange} // อัปเดต `selectedSections` ใน store
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
