'use client'

import React from 'react'
import { Flex, Loader, Radio } from '@mantine/core'
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';

export const StudentVisibility = () => {
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

  return (
    <Flex direction="column" gap="xs" ml='md' h='600px'>
      <Radio.Group 
        label="Rubric Item Visibility" 
        required
        value={values.studentVisibility}
        onChange={(value) => 
          useAssignmentSettingFormStore.getState().setField('studentVisibility', value)
        }
      >
        <Radio mt={4} 
          value="show-all" 
          label="Show all rubric items" 
        />
        <Radio mt={4}
          value="applied-only" 
          label="Show applied rubric items only" 
        />
        <Radio mt={4}
          value="hide-all" 
          label="Hide all rubric items" 
        />
        <Radio mt={4}
          value="positive-negative" 
          label="Show all rubric items for positive and applied rubric items for negative scoring" 
        />
      </Radio.Group>
    </Flex>
  )
}
