"use client";

import React, { useEffect } from 'react';
import CustomizeTime from './AssignmentSetting/CustomizeTime';
import BasicSettings from './AssignmentSetting/BasicSettings';
import { Tabs, Button, Modal, Group, Checkbox, Radio } from '@mantine/core';
import { RiDeleteBinLine, RiFilePaper2Line } from 'react-icons/ri';
import { CiSettings } from 'react-icons/ci';
import { LuPenLine, LuClock } from 'react-icons/lu';
import { GrShareOption } from 'react-icons/gr';
import { FiEye } from 'react-icons/fi';
import { useForm } from '@mantine/form';
import { useRouter , useParams } from 'next/navigation';
import { useCustomizeTimeStore, useModalAssignmentSettingStore } from '../../store/modal/useAssignmentSettingModal';
import { useFetchAssignmentSetting } from '../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useAssignmentSettingStore } from '../../store/useAssignmentSettingStore';
import { useUpdateAssignment } from '../../hooks/AssignmentSetting/useUpdateAssignment';

const AssignmentSetting: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const { assignmentSetting } = useAssignmentSettingStore();
  const { assignment_id, opened, closeModal } = useModalAssignmentSettingStore();
  const { isLoading, isSuccess } = useFetchAssignmentSetting(course_id as string, assignment_id as string);
  const { release_date, due_date, cut_off_date, selectedSections, resetCustomizeTime } = useCustomizeTimeStore();
  const { mutate: updateAssignment } = useUpdateAssignment();

  const form = useForm<{
    assignmentName: string;
    assignmentDescription: string;
    uploadBy: string;
    scoringMethod: string;
    allowLateSubmissions: boolean;
    published: boolean;
    enableRegrades: boolean;
    submissionType: string;
    rubricVisibility: string;
    enableGroupSubmission: boolean;
    groupSizeLimit: string;
    studentVisibility: string;
    releaseDate: Date | null;
    dueDate: Date | null;
    cutOffDate: Date | null;
    sections: string[];
  }>({
    initialValues: {
      assignmentName: '',
      assignmentDescription: '',
      uploadBy: '',
      scoringMethod: '',
      allowLateSubmissions: false,
      published: false,
      enableRegrades: false,
      enableGroupSubmission: false, 
      groupSizeLimit: '',
      submissionType: '',
      rubricVisibility: '',
      studentVisibility: '',
      releaseDate: null,
      dueDate: null,
      cutOffDate: null,
      sections: [],
    },
  });

  useEffect(() => {
    if (opened && isSuccess && assignmentSetting) {
      form.setValues({
        assignmentName: assignmentSetting.assignment?.assignmentName || '',
        assignmentDescription: assignmentSetting.assignment?.assignmentDescription || '',
        uploadBy: assignmentSetting.assignment?.submissBy || '',
        scoringMethod: assignmentSetting.assignment?.gradingType || '',
        allowLateSubmissions: assignmentSetting.assignment?.lateSubmiss || false,
        published: assignmentSetting.assignment?.published || false,
        enableRegrades: assignmentSetting.assignment?.regrades || false,
        enableGroupSubmission: assignmentSetting.assignment?.groupSubmiss || false,
        releaseDate: release_date ? new Date(release_date) : null,
        dueDate: due_date ? new Date(due_date) : null,
        cutOffDate: cut_off_date ? new Date(cut_off_date) : null,
        sections: selectedSections,
        // groupSizeLimit: assignmentSetting.group_size_limit || '',
        // submissionType: assignmentSetting.assignment?.submit_type || '',
        // rubricVisibility: assignmentSetting.rubric_visibility || '',
        // studentVisibility: assignmentSetting.student_visibility || '',
      });
    }
  }, [isLoading, isSuccess, assignmentSetting, release_date, due_date, cut_off_date, selectedSections]);

  const handleUpdateSettings = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('assignment_name', values.assignmentName);
    formData.append('assignment_description', values.assignmentDescription);
    formData.append('submiss_by', values.uploadBy);
    formData.append('grading_type', values.scoringMethod);
    formData.append('allowLateSubmissions', values.allowLateSubmissions ? 'true' : 'false');
    formData.append('enableGroupSubmission', values.enableGroupSubmission ? 'true' : 'false');
    formData.append('published', values.published ? 'true' : 'false');
    formData.append('enableRegrades', values.enableRegrades ? 'true' : 'false');
    
    formData.append('releaseDate', values.releaseDate ? new Date(values.releaseDate).toISOString() : '');
    formData.append('dueDate', values.dueDate ? new Date(values.dueDate).toISOString() : '');
    formData.append('cutOffDate', values.cutOffDate ? new Date(values.cutOffDate).toISOString() : '');
    formData.append('sections', JSON.stringify(values.sections)); 

    console.log('releaseDate:', formData.get('releaseDate'));
    console.log('dueDate:', formData.get('dueDate'));
    console.log('cutOffDate:', formData.get('cutOffDate'));

    updateAssignment(
      { formData, course_id: course_id as string, assignment_id: assignment_id as string },
      {
        onSuccess: () => {
          console.log('Assignment updated successfully');
          form.reset();
          resetCustomizeTime();
          closeModal();
        },
        onError: (error) => {
          console.error('Failed to update assignment:', error);
        },
      }
    );

    form.reset();    
    resetCustomizeTime();
    closeModal();
  };

  const binIcon = <RiDeleteBinLine />;
  const settingsIcon = <CiSettings />;
  const paperIcon = <RiFilePaper2Line />;
  const penIcon = <LuPenLine />;
  const choiceIcon = <GrShareOption />;
  const eyeIcon = <FiEye />;
  const clockIcon = <LuClock />;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        resetCustomizeTime(); 
        closeModal();
      }}
      title="Edit Assignment"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleUpdateSettings)}>
        <Tabs
          defaultValue="basic-settings"
          color="gray"
          variant="outline"
          p={16}
        >
          <Tabs.List>
            <Tabs.Tab value="basic-settings" leftSection={settingsIcon}>
              Basic Settings
            </Tabs.Tab>
            <Tabs.Tab value="customize-time" leftSection={clockIcon}>
              Time Setting
            </Tabs.Tab>
            <Tabs.Tab value="submission-settings" leftSection={paperIcon}>
              Submission Settings
            </Tabs.Tab>
            <Tabs.Tab value="grading-defaults" leftSection={penIcon}>
              Grading Defaults
            </Tabs.Tab>
            <Tabs.Tab value="rubric-settings" leftSection={choiceIcon}>
              Rubric Settings
            </Tabs.Tab>
            <Tabs.Tab value="student-visibility" leftSection={eyeIcon}>
              Student Visibility
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic-settings">
            <BasicSettings form={form} />
          </Tabs.Panel>

          <Tabs.Panel value="customize-time">
          <CustomizeTime/>
          </Tabs.Panel>

          {/* Tab 3: Submission Settings */}
          <Tabs.Panel mt="md" value="submission-settings">
            <Radio.Group
              label="Submission Type"
              required
              {...form.getInputProps('submissionType')}
            >
              <Radio value="variable" label="Variable length" mt={4} />
              <Radio value="fixed" label="Templated (fixed length)" mt={4} />
            </Radio.Group>
            <Checkbox.Group label="Template Visibility" mt="md">
              <Checkbox
                mt={4}
                value="false"
                label="Allow students to view and download the template"
              />
            </Checkbox.Group>
          </Tabs.Panel>

          {/* Tab 4: Grading Defaults */}
          <Tabs.Panel mt="md" value="grading-defaults">
            <Checkbox.Group label="Default Grading Settings">
              <Checkbox
                mt={4}
                label="Ceiling (maximum score is determined by points on the Outline)"
                value="false"
              />
              <Checkbox mt={4} label="Floor (minimum score is 0.0)" value="false" />
              <Checkbox
                mt={4}
                label="Apply these settings to all questions"
                value="false"
              />
            </Checkbox.Group>
          </Tabs.Panel>

          {/* Tab 5: Rubric Settings */}
          <Tabs.Panel mt="md" value="rubric-settings">
            <Radio.Group
              label="Default Selection Style"
              required
              {...form.getInputProps('rubricVisibility')}
            >
              <Radio mt={4} value="show-all" label="Show all rubric items" />
              <Radio mt={4} value="applied-only" label="Show applied rubric items only" />
              <Radio
                mt={4}
                value="positive-negative"
                label="Show all rubric items for positive and applied rubric items for negative scoring"
              />
              <Radio mt={4} value="hide-all" label="Hide all rubric items" />
            </Radio.Group>
          </Tabs.Panel>

          {/* Tab 5: Student Visibility */}
          <Tabs.Panel mt="md" value="student-visibility">
            <Radio.Group 
              label="Rubric Item Visibility" 
              required
              {...form.getInputProps('studentVisibility')}
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
                value="positive-negative" 
                label="Show all rubric items for positive and applied rubric items for negative scoring" 
              />
              <Radio mt={4}
                value="hide-all" 
                label="Hide all rubric items" 
              />
            </Radio.Group>
        </Tabs.Panel>
          
        </Tabs>
        <Group p={16} justify='end'>
          <Button type="submit">
            Save
          </Button>
          <Button color="red" variant="outline" leftSection={binIcon}>
            Delete Assignment
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AssignmentSetting;
