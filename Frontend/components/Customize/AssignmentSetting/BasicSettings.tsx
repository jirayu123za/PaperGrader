'use client'

import React from 'react';
import { TextInput, Checkbox, Radio, Group, Select, Flex, Text, Loader } from '@mantine/core';
import { Editor } from '../../Create/Editor.tsx/AssignmentEditor';
import { useAssignmentSettingFormStore } from '@/store/modal/useAssignmentSettingModal';

const BasicSettings: React.FC = () => {
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
            <TextInput
                label="Assignment Name"
                placeholder="Enter assignment name"
                required
                value={values.assignmentName}
                onChange={(event) => 
                    useAssignmentSettingFormStore.getState().setField('assignmentName', event.currentTarget.value)
                }
            />
            <Text size="sm" fw={500}>
                Assignment Description
            </Text>
            <Editor/>
            <Radio.Group
                label="Who will upload submissions?"
                required
                value={values.submittedBy}
                onChange={(value) => 
                    useAssignmentSettingFormStore.getState().setField('submittedBy', value)
                }
            >
                <Flex gap="md" pt={4}>
                    <Radio value="instructor" label="Instructor" />
                    <Radio value="student" label="Student" />
                </Flex>
            </Radio.Group>
            <Select
                label="Scoring Method"
                placeholder="Select Default Scoring Method"
                clearable
                data={[
                    { value: 'negative', label: 'Negative scoring' },
                    { value: 'positive', label: 'Positive scoring' },
                ]}
                value={values.scoringMethod}
                onChange={(value) => useAssignmentSettingFormStore.getState().setField('scoringMethod', value || '')}
            />
            <Checkbox.Group label="Other Settings">
                <Group mt={2} gap={4}>
                    <Checkbox
                        label="Allow Late Submissions"
                        value="lateSubmitted"
                        checked={values.lateSubmitted}
                        onChange={(event) => 
                            useAssignmentSettingFormStore.getState().setField('lateSubmitted', event.currentTarget.checked)
                        }
                    />
                    <Checkbox
                        label="Published"
                        value="published"
                        checked={values.published}
                        onChange={(event) => 
                            useAssignmentSettingFormStore.getState().setField('published', event.currentTarget.checked)
                        }
                    />
                    <Checkbox
                        value="enableRegrades"
                        label="Enable Regrades"
                        checked={values.regrades}
                        onChange={(event) => 
                            useAssignmentSettingFormStore.getState().setField('regrades', event.currentTarget.checked)
                        }
                    />
                </Group>
            </Checkbox.Group>
            <Checkbox.Group label="Group Settings">
                {/* Checkbox for Group Submission */}
                <Checkbox
                    mt={4}
                    value="groupSubmitted"
                    label="Enable Group Submission"
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
                        mt="md"
                        value={values.groupSizeLimit}
                        onChange={(event) => useAssignmentSettingFormStore.getState().setField('groupSizeLimit', event.currentTarget.value)}
                        type="number"
                    />
                )}
            </Checkbox.Group>
        </Flex>
    );
};

export default BasicSettings;
