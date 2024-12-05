import React from 'react';
import {Tabs,Button,TextInput,Checkbox,Radio,Group,Paper,Select,} from '@mantine/core';

const AssignmentSetting: React.FC = () => {
  const handleSaveSettings = () => {
    console.log('Save Assignment Settings');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Assignment</h1>

      {/* Tabs Navigation */}
      <Tabs defaultValue="basic-settings">
        <Tabs.List>
          <Tabs.Tab value="basic-settings">Basic Settings</Tabs.Tab>
          <Tabs.Tab value="submission-settings">Submission Settings</Tabs.Tab>
          <Tabs.Tab value="grading-defaults">Grading Defaults</Tabs.Tab>
          <Tabs.Tab value="rubric-settings">Rubric Settings</Tabs.Tab>
          <Tabs.Tab value="student-visibility">Student Visibility</Tabs.Tab>
        </Tabs.List>

        {/* Tab 1: Basic Settings */}
               {/* Tab 1: Basic Settings */}
               <Tabs.Panel value="basic-settings" className="mt-4">
          <Paper withBorder shadow="md" p="lg">
            {/* Assignment Name */}
            <TextInput 
              label="Assignment Name *" 
              required 
              placeholder="Enter assignment name" 
            />

            {/* Assignment Description */}
            <TextInput 
              label="Description" 
              placeholder="Enter a short description of the assignment" 
              mt="md"
            />

            {/* Who will submit */}
            <Radio.Group 
              label="Who will upload submissions?" 
              required 
              mt="md"
            >
              <Radio value="instructor" label="Instructor" />
              <Radio value="student" label="Student" />
            </Radio.Group>

            {/* Grading Type */}
            <Select
              label="Grading Type"
              placeholder="Select grading type"
              data={[
                { value: 'manual', label: 'Manual Grading' },
                { value: 'automatic', label: 'Automatic Grading' },
              ]}
              mt="md"
            />

            {/* Late Submission */}
            <Checkbox 
              label="Allow Late Submissions" 
              mt="md" 
            />

            {/* Group Submission */}
            <Checkbox 
              label="Enable Group Submission" 
              mt="md" 
            />

            {/* Published */}
            <Checkbox 
              label="Published" 
              mt="md" 
            />

            {/* Regrades */}
            <Checkbox 
              label="Enable Regrades" 
              mt="md" 
            />
          </Paper>
        </Tabs.Panel>

        {/* Tab 2: Submission Settings */}
        <Tabs.Panel value="submission-settings" className="mt-4">
          <Paper withBorder shadow="md" p="lg">
            <Radio.Group label="Submission Type" required>
              <Radio value="variable" label="Variable length" />
              <Radio value="fixed" label="Templated (fixed length)" />
            </Radio.Group>
            <Checkbox mt="md" label="Enable group submission" />
            <TextInput mt="md" label="Limit Group Size" placeholder="No Max" />
            <Checkbox mt="md" label="Allow students to view and download the template" />
          </Paper>
        </Tabs.Panel>

        {/* Tab 3: Grading Defaults */}
        <Tabs.Panel value="grading-defaults" className="mt-4">
          <Paper withBorder shadow="md" p="lg">
            <Radio.Group label="Default Scoring Method" required>
              <Radio value="negative" label="Negative scoring" />
              <Radio value="positive" label="Positive scoring" />
            </Radio.Group>
            <Checkbox mt="md" label="Ceiling (maximum score is determined by points on the Outline)" />
            <Checkbox mt="md" label="Floor (minimum score is 0.0)" />
            <Checkbox mt="md" label="Apply these settings to all questions" />
          </Paper>
        </Tabs.Panel>

        {/* Tab 4: Rubric Settings */}
        <Tabs.Panel value="rubric-settings" className="mt-4">
          <Paper withBorder shadow="md" p="lg">
            <Radio.Group label="Default Selection Style" required>
              <Radio value="single" label="Select one" />
              <Radio value="multiple" label="Select many" />
            </Radio.Group>
            <Radio.Group mt="md" label="Create your Rubric">
              <Radio value="before" label="Before student submission" />
              <Radio value="during" label="While grading submissions" />
            </Radio.Group>
          </Paper>
        </Tabs.Panel>

        {/* Tab 5: Student Visibility */}
        <Tabs.Panel value="student-visibility" className="mt-4">
          <Paper withBorder shadow="md" p="lg">
            <Radio.Group label="Rubric Item Visibility" required>
              <Radio value="show-all" label="Show all rubric items" />
              <Radio value="applied-only" label="Show applied rubric items only" />
              <Radio value="positive-negative" label="Show all rubric items for positive and applied rubric items for negative scoring" />
              <Radio value="hide-all" label="Hide all rubric items" />
            </Radio.Group>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Save and Delete Buttons */}
      <Group position="apart" mt="lg">
        <Button color="red" variant="outline">
          Delete Assignment
        </Button>
        <Button onClick={handleSaveSettings}>Save</Button>
      </Group>
    </div>
  );
};

export default AssignmentSetting;
