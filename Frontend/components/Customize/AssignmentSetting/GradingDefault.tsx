'use client'

import React from 'react'
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';
import { Checkbox, Flex, Loader } from '@mantine/core'

export const GradingDefault = () => {
  const { values, reset } = useAssignmentSettingFormStore();
  const [isLoading, setIsLoading] = React.useState(true);
    
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="md">
        <Loader color="blue" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" gap="xs" ml='md'>
        <Checkbox.Group label="Default Grading Settings">
            <Checkbox 
                mt={4}
                label="Floor (minimum score is 0.0)" 
                value="false" 
            />
            <Checkbox
                mt={4}
                label="Apply these settings to all questions"
                value="false"
            />
            <Checkbox
                mt={4}
                label="Ceiling (maximum score is determined by points on the Outline)"
                value="false"
            />
        </Checkbox.Group>
    </Flex>
  )
}
