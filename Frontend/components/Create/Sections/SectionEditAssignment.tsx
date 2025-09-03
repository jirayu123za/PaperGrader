'use client'
import React from 'react';
import { Text, Loader, MultiSelect } from '@mantine/core';
import { useFetchAssignmentSections } from '@/hooks/AssignmentSetting/useFetchAssignmentSections';
import { useAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { useModalAssignmentTimeSettingStore } from '@/store/modal/useAssignmentTimeSettingModal';

const SectionEditAssignment: React.FC = () => {
  const { assignment_id } = useModalAssignmentTimeSettingStore();
  const { data: sections, isLoading, error } = useFetchAssignmentSections(assignment_id);
  const { selectedSectionIDs, setSectionIDs } = useAssignmentSettingStore();

  const allOptions = (sections ?? []).map(section => ({
    label: section.section_name,
    value: section.section_id,
  }));

  const handleChange = (values: string[]) => {
    setSectionIDs(values);
  };

  if (isLoading) return <Loader size="xs" type="bars" />;
  if (error) return <Text c="red">Error fetching sections: {error.message}</Text>;
  if (!sections) return null;

  return (
    <MultiSelect
      data={allOptions}
      placeholder="Add or select sections"
      label="Edit sections"
      searchable
      clearable
      value={selectedSectionIDs.filter(id => allOptions.some(opt => opt.value === id))}
      onChange={handleChange}
      maxDropdownHeight={150}
      hidePickedOptions
    />
  );
};

export default SectionEditAssignment;
