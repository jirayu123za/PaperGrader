import React from 'react';
import { TagsInput, Text, Loader } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useSelectSectionStore } from '../../../store/useSectionStore';
import { useModalAssignmentSettingStore } from '../../../store/modal/useAssignmentSettingModal';

const SectionEditAssignment: React.FC = () => {
  const { assignment_id } = useModalAssignmentSettingStore(state => state);
  const { data: sections, isLoading, error } = useFetchAssignmentSections(assignment_id);
  const { selectedSections, setSelectedSections } = useSelectSectionStore();

  const selectedTags = sections
    ? sections
      .filter((section) => selectedSections.includes(section.section_id))
      .map((section) => section.section_name)
    :[]
  ;

  const allTagsData = sections
    ? sections.map((section) => ({
        label: section.section_name,
        value: section.section_id,
      }))
    :[]
  ;

  const handleTagsChange = (tags: string[]) => {
    const updatedSelectedSections = sections
      ? sections
          .filter((section) => tags.includes(section.section_name))
          .map((section) => section.section_id)
      : [];
    setSelectedSections(updatedSelectedSections);
  };

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div className="mt-4">
      <TagsInput
        data={allTagsData}
        placeholder="Add or select sections"
        value={selectedTags}
        onChange={handleTagsChange}
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
