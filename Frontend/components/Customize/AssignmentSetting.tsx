"use client";

import React, { useState } from 'react';
import CustomizeTime from './AssignmentSetting/CustomizeTime';
import BasicSettings from './AssignmentSetting/BasicSettings';
import { Tabs, Button, Modal, Group } from '@mantine/core';
import { RiDeleteBinLine, RiFilePaper2Line } from 'react-icons/ri';
import { CiSettings } from 'react-icons/ci';
import { LuPenLine, LuClock } from 'react-icons/lu';
import { GrShareOption } from 'react-icons/gr';
import { FiEye } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { useAssignmentSettingFormStore, useAssignmentSettingStore, useModalAssignmentSettingStore } from '../../store/modal/useAssignmentSettingModal';
import { useFetchAssignmentSetting } from '../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useUpdateAssignment } from '../../hooks/AssignmentSetting/useUpdateAssignment';
import { SubmissionSettings } from './AssignmentSetting/SubmissionSettings';
import { GradingDefault } from './AssignmentSetting/GradingDefault';
import { RubricSettings } from './AssignmentSetting/RubricSettings';
import { StudentVisibility } from './AssignmentSetting/StudentVisibility';

const AssignmentSetting: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { assignment_id, opened, closeModal } = useModalAssignmentSettingStore();
  const { isLoading } = useFetchAssignmentSetting(course_id as string, assignment_id as string);
  const { mutate: updateAssignment, isPending } = useUpdateAssignment();

  const [activeTab, setActiveTab] = useState<string | null>('basic-settings');

  const icons = {
    bin: <RiDeleteBinLine />,
    settings: <CiSettings />,
    paper: <RiFilePaper2Line />,
    pen: <LuPenLine />,
    choice: <GrShareOption />,
    eye: <FiEye />,
    clock: <LuClock />,
  };
  
  const { selectedSectionIDs } = useAssignmentSettingStore();
  const { values, reset } = useAssignmentSettingFormStore();
  
  const handleUpdateSettings = () => {
    const formData = new FormData();

    formData.append('assignment_name', values.assignmentName);
    formData.append('assignment_description', values.assignmentDescription);
    formData.append('submitted_by', values.submittedBy);
    formData.append('grading_type', values.scoringMethod);
    formData.append('late_submitted', values.lateSubmitted ? 'true' : 'false');
    formData.append('group_submitted', values.groupSubmitted ? 'true' : 'false');
    formData.append('published', values.published ? 'true' : 'false');
    formData.append('regrades', values.regrades ? 'true' : 'false');
    formData.append('release_date', values.releaseDate ? new Date(values.releaseDate).toISOString() : '');
    formData.append('due_date', values.dueDate ? new Date(values.dueDate).toISOString() : '');
    formData.append('cut_off_date', values.cutOffDate ? new Date(values.cutOffDate).toISOString() : '');
    formData.append('sections', JSON.stringify(selectedSectionIDs));

    console.log('assignment_name:', values.assignmentName);
    console.log('assignment_description:', values.assignmentDescription);
    console.log('submitted_by:', values.submittedBy);
    console.log('grading_type:', values.scoringMethod);
    console.log('late_submitted:', values.lateSubmitted);
    console.log('group_submitted:', values.groupSubmitted);
    console.log('published:', values.published);
    console.log('regrades:', values.regrades);
    console.log('release_date:', values.releaseDate ? new Date(values.releaseDate).toISOString() : '');
    console.log('due_date:', values.dueDate ? new Date(values.dueDate).toISOString() : '');
    console.log('cut_off_date:', values.cutOffDate ? new Date(values.cutOffDate).toISOString() : '');
    console.log('sections:', JSON.stringify(selectedSectionIDs));

    // updateAssignment(
    //   { formData, course_id: course_id as string, assignment_id: assignment_id as string },
    //   {
    //     onSuccess: () => {
    //       console.log('Assignment updated successfully');
    //       reset();
    //       closeModal();
    //     },
    //     onError: (error) => {
    //       console.error('Failed to update assignment:', error);
    //     },
    //   }
    // );
    closeModal();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        closeModal();
      }}
      title="Edit assignment"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateSettings();
        }}
      >
        <Tabs orientation="vertical" defaultValue="basic-settings" color="violet" value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic-settings" leftSection={icons.settings}>
              Basic Settings
            </Tabs.Tab>
            <Tabs.Tab value="customize-time" leftSection={icons.clock}>
              Time Setting
            </Tabs.Tab>
            <Tabs.Tab value="submission-settings" leftSection={icons.paper}>
              Submission Settings
            </Tabs.Tab>
            <Tabs.Tab value="grading-defaults" leftSection={icons.choice}>
              Grading Defaults
            </Tabs.Tab>
            <Tabs.Tab value="rubric-settings" leftSection={icons.pen}>
              Rubric Settings
            </Tabs.Tab>
            <Tabs.Tab value="student-visibility" leftSection={icons.eye}>
              Student Visibility
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab 1: Basic Settings */}
          <Tabs.Panel value="basic-settings">
            {/* <BasicSettings /> */}
            {activeTab === 'basic-settings' && <BasicSettings />}
          </Tabs.Panel>

          {/* Tab 2: Customize Time */}
          <Tabs.Panel value="customize-time">
            {/* <CustomizeTime/> */}
            {activeTab === 'customize-time' && <CustomizeTime />}
          </Tabs.Panel>

          {/* Tab 3: Submission Settings */}
          <Tabs.Panel value="submission-settings">
            {/* <SubmissionSettings/> */}
            {activeTab === 'submission-settings' && <SubmissionSettings />}
          </Tabs.Panel>

          {/* Tab 4: Grading Defaults */}
          <Tabs.Panel value="grading-defaults">
            {/* <GradingDefault/> */}
            {activeTab === 'grading-defaults' && <GradingDefault />}
          </Tabs.Panel>

          {/* Tab 5: Rubric Settings */}
          <Tabs.Panel value="rubric-settings">
            {/* <RubricSettings/> */}
            {activeTab === 'rubric-settings' && <RubricSettings />}
          </Tabs.Panel>

          {/* Tab 5: Student Visibility */}
          <Tabs.Panel value="student-visibility">
            {/* <StudentVisibility/> */}
            {activeTab === 'student-visibility' && <StudentVisibility />}
          </Tabs.Panel>
        </Tabs>

        <Group p={16} justify='end' gap='xs'>
          <Button type="submit" disabled={isLoading} loading={isPending}>
            Save
          </Button>
          <Button color="red" variant="outline" leftSection={icons.bin}>
            Delete Assignment
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AssignmentSetting;
