import React, { useState, useEffect } from 'react';
import { Checkbox, TagsInput, Text, Loader } from '@mantine/core';
import { useFetchSections } from '../../../hooks/useFetchSelectSection';

interface SectionSelectorProps {
  onSectionChange: (sections: string[]) => void;
}

interface Section {
    section_id: string;
    section_name: string;
  }
  
  const SectionSelector: React.FC<SectionSelectorProps> = ({ onSectionChange }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const { data: sections = [], isLoading, error } = useFetchSections();
  
    useEffect(() => {
      onSectionChange(selectedSections);
    }, [selectedSections, onSectionChange]);
  
    const handleTagChange = (tags: string[]) => {
      setSelectedSections(tags);
    };
  
    if (isLoading) return <Loader size="sm" />;
    if (error) return <Text color="red">Error fetching sections: {error.message}</Text>;
  
    return (
      <div>
        <Checkbox
          label="Enable Section Selection"
          checked={isEnabled}
          onChange={(event) => setIsEnabled(event.currentTarget.checked)}
        />
        {isEnabled && (
          <div className="mt-4">
            <TagsInput
              data={sections.map((section: Section) => ({
                label: section.section_name, // ใช้ section_name สำหรับแสดง
                value: section.section_id,  // ใช้ section_id สำหรับค่า
              }))}
              placeholder="Add or select sections"
              value={selectedSections}
              onChange={handleTagChange}
              label="Select Sections"
            />
          </div>
        )}
      </div>
    );
  };

export default SectionSelector;
