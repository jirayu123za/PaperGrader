import React from 'react';
import { TagsInput, Text, Loader } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useAssignmentSectionsStore, useSelectSectionStore } from '../../../store/useSectionStore';
import { useRouter } from 'next/router';

const SectionEditAssignment: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
  const router = useRouter();
  const { assignment_id } = router.query; // Retrieve assignment_id from the route
  const { data, isLoading, error } = useFetchAssignmentSections(assignment_id as string);

  const { assignmentSections } = useAssignmentSectionsStore();
  const { selectedSections, setSelectedSections } = useSelectSectionStore();

  // Map assignment sections to TagsInput-compatible data structure
  const sectionsData = assignmentSections.map((section) => ({
    label: section.section_name,
    value: section.section_id,
  }));

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div className="mt-4">
      <TagsInput
        data={sectionsData}
        placeholder="Add or select sections"
        value={selectedSections}
        onChange={(tags) => {
          setSelectedSections(tags); // Update the selected sections in the store
        }}
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
