"use client";

import React from 'react';
import { useRouter , useParams } from 'next/navigation';
import { TagsInput, Text, Loader } from '@mantine/core';
import { useFetchSections } from '../../../hooks/useFetchSelectSection';
import { useSectionsListStore, useSelectSectionStore } from '../../../store/useSectionStore';

interface Section {
  section_id: string;
  section_name: string;
}

interface SectionSelectorProps {
  defaultEnabled?: boolean;
}

const SectionSelector: React.FC<SectionSelectorProps> = () => {
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const { data, isLoading, error } = useFetchSections(course_id as string);
  const { sectionsList } = useSectionsListStore();
  const { selectedSections, setSelectedSections } = useSelectSectionStore();

  const sectionsData =
    sectionsList && sectionsList.length > 0
      ? sectionsList.map((section: Section) => ({
          label: section.section_name,
          value: section.section_id,
        }))
      : [];

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div className="mt-4">
      <TagsInput
        data={sectionsData}
        placeholder="Add or select sections"
        value={selectedSections}
        onChange={(tags) => {
          setSelectedSections(tags);
        }}
        label="Select Sections"
        maxDropdownHeight={100}
        comboboxProps={{ shadow: 'md' }}
        clearable
        required
        splitChars={[' ', ',', '\n']}
      />
    </div>
  );
};

export default SectionSelector;