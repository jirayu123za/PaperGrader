import React from 'react';
import { TextInput, Checkbox, Radio, Group, Select, Flex, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Editor } from '../../Create/Editor.tsx/AssignmentEditor';

interface BasicSettingsProps {
    form: UseFormReturnType<{
        assignmentName: string;
        assignmentDescription: string;
        uploadBy: string;
        scoringMethod: string;
        allowLateSubmissions: boolean;
        published: boolean;
        enableRegrades: boolean;
        enableGroupSubmission: boolean;
        groupSizeLimit: string;
        submissionType: string;
        rubricVisibility: string;
        studentVisibility: string;
    }>;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({ form }) => {
    return (
        <>
            <TextInput
                mt="md"
                label="Assignment Name"
                required
                placeholder="Enter assignment name"
                {...form.getInputProps('assignmentName')}
            />
            <Text size="sm" fw={500} mb={2} mt="md">
                Assignment Description
            </Text>
            <Editor 
                value={form.values.assignmentDescription}
                onChange={(value: string) => 
                    form.setFieldValue('assignmentDescription', value)
                }
            />
            <Radio.Group
                label="Who will upload submissions?"
                required
                mt="md"
                {...form.getInputProps('uploadBy')}
            >
                <Flex gap="md" pt={4}>
                    <Radio value="instructor" label="Instructor" />
                    <Radio value="student" label="Student" />
                </Flex>
            </Radio.Group>
            <Select
                label="Scoring Method"
                placeholder="Select Default Scoring Method"
                data={[
                    { value: 'negative', label: 'Negative scoring' },
                    { value: 'positive', label: 'Positive scoring' },
                ]}
                clearable
                mt="md"
                {...form.getInputProps('scoringMethod')}
            />
            <Checkbox.Group label="Other Settings" mt="md">
                <Group mt={4}>
                    <Checkbox
                        value="allowLateSubmissions"
                        label="Allow Late Submissions"
                        {...form.getInputProps('allowLateSubmissions', { type: 'checkbox' })}
                    />
                    <Checkbox
                        value="published"
                        label="Published"
                        {...form.getInputProps('published', { type: 'checkbox' })}
                    />
                    <Checkbox
                        value="enableRegrades"
                        label="Enable Regrades"
                        {...form.getInputProps('enableRegrades', { type: 'checkbox' })}
                    />
                </Group>
            </Checkbox.Group>
            <Checkbox.Group label="Group Settings" mt="md">
                {/* Checkbox for Group Submission */}
                <Checkbox
                    mt={4}
                    value="enableGroupSubmission"
                    label="Enable Group Submission"
                    {...form.getInputProps('enableGroupSubmission', { type: 'checkbox' })}
                />

                {/* show TextInput when Group Submission opened */}
                {form.values.enableGroupSubmission && (
                    <TextInput
                        label="Limit Group Size"
                        placeholder="Enter max group size"
                        mt="md"
                        {...form.getInputProps('groupSizeLimit')}
                    />
                )}
            </Checkbox.Group>
        </>
    );
};

export default BasicSettings;
