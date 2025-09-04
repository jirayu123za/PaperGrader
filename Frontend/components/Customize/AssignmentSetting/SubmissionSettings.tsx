'use client'

import React from 'react'
import { Checkbox, Divider, Flex, Loader, Radio, TextInput } from '@mantine/core'
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';

export const SubmissionSettings = () => {
  const { values, reset } = useAssignmentSettingFormStore();
  const [ isLoading, setIsLoading ] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="md" h='500px'>
        <Loader color="blue" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="xs" h='500px'>
      <Radio.Group
        label="Who will upload submissions?"
        required
        value={values.submittedBy}
        onChange={(value) => 
            useAssignmentSettingFormStore.getState().setField('submittedBy', value)
        }
      >
        <Flex gap="xl" pt={4}>
          <Radio value="instructor" label="Instructor" />
          <Radio value="student" label="Student" />
        </Flex>
      </Radio.Group>

      <Divider label="Group submission" labelPosition="left" mt="xs"/>

      {/* Checkbox for Group Submission */}
      <Flex direction="column">
        <Checkbox
          mt={2}
          value="groupSubmitted"
          label="Enable group submission"
          checked={values.groupSubmitted}
          onChange={(event) => 
            useAssignmentSettingFormStore.getState().setField('groupSubmitted', event.currentTarget.checked)
          }
        />
        {/* show TextInput when Group Submission opened */}
        {values.groupSubmitted && (
          <TextInput
            label="Limit Group Size"
            placeholder="Enter max group size"
            mt="xs"
            value={values.groupSizeLimit}
            onChange={(event) => useAssignmentSettingFormStore.getState().setField('groupSizeLimit', event.currentTarget.value)}
            type="number"
          />
        )}
      </Flex>

      <Divider label="Other settings" labelPosition="left" mt="xs"/>

      {/* Other Settings */}
      <Flex direction="column" gap={4} mt={2}>
        <Checkbox
          label="Allow Late Submissions"
          checked={!!values.lateSubmitted}
          onChange={(e) =>
            useAssignmentSettingFormStore.getState().setField('lateSubmitted', e.currentTarget.checked)
          }
        />
        <Checkbox
          label="Enable Regrades"
          checked={!!values.regrades}
          onChange={(e) =>
            useAssignmentSettingFormStore.getState().setField('regrades', e.currentTarget.checked)
          }
        />
      </Flex>
    </Flex>
  )
}
