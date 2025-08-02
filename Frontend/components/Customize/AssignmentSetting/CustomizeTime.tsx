"use client";

import '@mantine/dates/styles.css';
import React from 'react';
import dayjs from 'dayjs';
import SectionEditAssignment from '../../Create/Sections/SectionEditAssignment';
import { DateTimePicker } from '@mantine/dates';
import { Flex, Loader } from '@mantine/core';
import { useAssignmentSettingFormStore } from '../../../store/modal/useAssignmentSettingModal';

const CustomizeTime: React.FC = () => {
  const { values, reset } = useAssignmentSettingFormStore();
  const [isLoading, setIsLoading] = React.useState(true);
    
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="md" h='600px'>
        <Loader color="blue" />
      </Flex>
    );
  }

  console.log('CustomizeTime values:', values);
  

  return (
    <Flex direction="column" gap="xs" ml='md' h='600px'>
      <SectionEditAssignment/>
      
      <Flex gap="md">
        <DateTimePicker
          style={{ flex: 1 }}
          label="Release date"
          placeholder="Select release date"
          value={values.releaseDate || null}
          onChange={(date) => {
            useAssignmentSettingFormStore.getState().setField('releaseDate', date);
          }}
          valueFormat="DD/MM/YYYY HH:mm A"
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: '12h',
          }}
        />
        <DateTimePicker
          style={{ flex: 1 }}
          label="Due date"
          placeholder="Select due date"
          value={values.dueDate || null}
          onChange={(date) => {
            useAssignmentSettingFormStore.getState().setField('dueDate', date);
          }}
          valueFormat="DD/MM/YYYY HH:mm A"
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: '12h',
          }}
        />
      </Flex>
      <DateTimePicker
        label="Cut off date"
        placeholder="Select cut off date"
        value={values.cutOffDate || null}
        onChange={(date) => {
          useAssignmentSettingFormStore.getState().setField('cutOffDate', date);
        }}
        valueFormat="DD/MM/YYYY HH:mm A"
        timePickerProps={{
          withDropdown: true,
          popoverProps: { withinPortal: false },
          format: '12h',
        }}
      />
    </Flex>
  );
};

export default CustomizeTime;
