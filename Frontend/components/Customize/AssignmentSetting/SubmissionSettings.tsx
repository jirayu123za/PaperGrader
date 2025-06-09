'use client'

import React from 'react'
import { Checkbox, Flex, Loader, Radio } from '@mantine/core'
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';

export const SubmissionSettings = () => {
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
        label="Submission Type"
        required
        value={values.submittedBy}
        onChange={(value) => 
          useAssignmentSettingFormStore.getState().setField('submittedBy', value)
        }
      >
        <Radio value="variable" label="Variable length" mt={4} />
        <Radio value="fixed" label="Templated (fixed length)" mt={4} />
      </Radio.Group>
      <Checkbox.Group label="Template Visibility">
        <Checkbox
          mt={4}
          value="false"
          label="Allow students to view and download the template"
        />
      </Checkbox.Group>
    </Flex>
  )
}
