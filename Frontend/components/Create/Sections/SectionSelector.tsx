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

interface SectionSelectorProps {
  setSections: (sections: string[]) => void;
  defaultEnabled?: boolean;
}

const SectionSelector: React.FC<SectionSelectorProps> = ({
  setSections,
  defaultEnabled = false,
}) => {
  const router = useRouter();
  const { course_id } = router.query;
  const [isEnabled, { toggle, open }] = useDisclosure(defaultEnabled);
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

  const validateTag = (tag: string) => {
    if (sectionsData.length === 0) return true;
    return sectionsData.some((section) => section.label === tag);
  };

  const handleTagChange = (tags: string[]) => {
    const validTags = tags.filter((tag) => validateTag(tag));
    setSelectedSections(validTags);
    setSections(validTags);
  };

  React.useEffect(() => {
    if (defaultEnabled) {
      open();
    }
  }, [defaultEnabled, open]);

  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;

  return (
    <div>
      {!defaultEnabled && (
        <Checkbox
          label="Enable Section Selection"
          checked={isEnabled}
          onChange={toggle}
        />
      )}
      {(isEnabled || defaultEnabled) && (
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
            required
            splitChars={[' ', ',', '\n']}
          />
        </div>
      )}
    </div>
  );
};

export default SectionSelector;
