// YearPicker.tsx
import React from 'react';
import { Select } from '@mantine/core';

interface YearPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const YearPicker: React.FC<YearPickerProps> = ({ value, onChange }) => {
  const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i).toString());

  return (
    <Select
      label="Academia year"
      placeholder="Select Academia year"
      data={yearOptions}
      value={value}
      onChange={(value) => {
        if (value) {
          onChange(value);
        }
      }}
      required
      className="w-full"
    />
  );
};

export default YearPicker;
