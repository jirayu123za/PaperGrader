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
import { useRouter } from 'next/router';
import { useModalAssignmentSettingStore } from '../../store/modal/useAssignmentSettingModal';
import { useFetchAssignmentSetting } from '../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useAssignmentSettingStore } from '../../store/useAssignmentSettingStore';

const AssignmentSetting: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { assignmentSetting } = useAssignmentSettingStore();
  const { assignment_id, opened, closeModal } = useModalAssignmentSettingStore();
  const { isLoading, isSuccess } = useFetchAssignmentSetting(course_id as string, assignment_id as string);

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
        
        // groupSizeLimit: assignmentSetting.group_size_limit || '',
        // submissionType: assignmentSetting.assignment?.submit_type || '',
        // rubricVisibility: assignmentSetting.rubric_visibility || '',
        // studentVisibility: assignmentSetting.student_visibility || '',
      });
    }
  }, [isLoading, isSuccess, assignmentSetting]);

  const handleUpdateSettings = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('assignment_name', values.assignmentName);
    formData.append('assignment_description', values.assignmentDescription);
    formData.append('submiss_by', values.uploadBy);
    formData.append('grading_type', values.scoringMethod);
    formData.append('late_submiss', values.allowLateSubmissions.toString());
    formData.append('group_submiss', values.enableGroupSubmission.toString());
    formData.append('published', values.published.toString());
    formData.append('regrades', values.enableRegrades.toString());

    console.log('Saved Form Values:', values);
    form.reset();
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
              Customize Time
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
        <Group mt="lg">
          <Button color="red" variant="outline" leftSection={binIcon}>
            Delete Assignment
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AssignmentSetting;
