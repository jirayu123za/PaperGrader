import React from 'react';
import { Select } from '@mantine/core';

interface YearPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const YearPicker: React.FC<YearPickerProps> = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());
  const data = yearOptions.map((year) => ({
    value: year,
    label: (parseInt(year, 10) + 543).toString(),
  }));

  return (
    <Select
      label="Academic year"
      placeholder="Select Academic year"
      data={data}
      value={value}
      onChange={(val) => {
        if (val) {
          onChange(val);
        }
      }}
      required
      className="w-full"
    />
  );
};

export default YearPicker;
