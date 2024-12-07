import React from 'react';
import { TextInput, Checkbox, Radio, Group, Select, Flex } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

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
    }>;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({ form }) => {
    return (
        <div>
            <TextInput
                label="Assignment Name"
                required
                placeholder="Enter assignment name"
                {...form.getInputProps('assignmentName')}
            />
            <TextInput
                label="Assignment Description"
                placeholder="Enter a short description of the assignment"
                mt="md"
                {...form.getInputProps('assignmentDescription')}
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
                {/* Checkbox สำหรับเปิดใช้งาน Group Submission */}
                <Checkbox
                    label="Enable Group Submission"
                    checked={form.values.enableGroupSubmission} // ผูกสถานะกับ form
                    onChange={(event) => {
                        const isChecked = event.currentTarget.checked; // อ่านสถานะ checkbox
                        form.setFieldValue('enableGroupSubmission', isChecked); // อัปเดตค่าใน form
                    }}
                />

                {/* แสดง TextInput เมื่อ Group Submission ถูกเปิดใช้งาน */}
                {form.values.enableGroupSubmission && (
                    <TextInput
                        label="Limit Group Size"
                        placeholder="Enter max group size"
                        mt="md"
                        {...form.getInputProps('groupSizeLimit')}
                    />
                )}
            </Checkbox.Group>

        </div>
    );
};

export default BasicSettings;
