import React from 'react';
import { useRouter } from 'next/router';
import { Checkbox, TagsInput, Text, Loader } from '@mantine/core';
import { useFetchSections } from '../../../hooks/useFetchSelectSection';
import { useSectionsListStore, useSelectSectionStore } from '../../../store/useSectionStore';
import { useDisclosure } from '@mantine/hooks';

interface Section {
    section_id: string;
    section_name: string;
  }
  
  const SectionSelector: React.FC<{ setSections: (sections: string[]) => void }> = ({ setSections }) => {
    const router = useRouter();
    const { course_id } = router.query;
    const [isEnabled, { toggle }] = useDisclosure();
    const { data, isLoading, error } = useFetchSections(course_id as string);
    const { sectionsList, setSectionsList } = useSectionsListStore();
    const { selectedSections, setSelectedSections } = useSelectSectionStore();

    const handleTagChange = (tags: string[]) => {
      setSelectedSections(tags);
      setSections(tags);
    };
    
    if (isLoading) return <Loader size="sm" />;
    if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

    const sectionsData = sectionsList && sectionsList.length > 0
    ? sectionsList.map((section: Section) => ({
        label: section.section_name,
        value: section.section_id,
      }))
    : [
        { value: 'No sections available: Please create section of this course first!', disabled: true },
      ];
  
    return (
      <div>
        <Checkbox
          label="Enable Section Selection"
          checked={isEnabled}
          onChange={toggle}
        />
        {isEnabled && (
          <div className="mt-4">
            <TagsInput
              data={sectionsData}
              placeholder="Add or select sections"
              value={selectedSections}
              onChange={handleTagChange}
              label="Select Sections"
              maxDropdownHeight={100}
              comboboxProps={{ shadow: 'md' }}
              clearable
            />
          </div>
        )}
      </div>
    );
  };

export default SectionSelector;
