"use client";

import React from 'react';
import BasicSettings from './AssignmentSetting/BasicSettings';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Tabs, Button, Modal, Group, Flex } from '@mantine/core';
import { RiDeleteBinLine, RiFilePaper2Line } from 'react-icons/ri';
import { CiSettings } from 'react-icons/ci';
import { LuPenLine, LuClock } from 'react-icons/lu';
import { GrShareOption } from 'react-icons/gr';
import { FiEye } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { useAssignmentSettingFormStore, useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { useFetchAssignmentSetting } from '@/hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useUpdateAssignment } from '@/hooks/AssignmentSetting/useUpdateAssignment';
import { SubmissionSettings } from '@/components/Customize/AssignmentSetting/SubmissionSettings';
import { notifications } from '@mantine/notifications';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok"); 

const AssignmentSetting: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { assignment_id, opened, closeModal } = useModalAssignmentSettingStore();
  const { isLoading } = useFetchAssignmentSetting(course_id as string, assignment_id as string);
  const { mutate: updateAssignment, isPending } = useUpdateAssignment();
  const { values, reset } = useAssignmentSettingFormStore();

  const icons = {
    bin: <RiDeleteBinLine />,
    settings: <CiSettings />,
    paper: <RiFilePaper2Line />,
    pen: <LuPenLine />,
    choice: <GrShareOption />,
    eye: <FiEye />,
    clock: <LuClock />,
  };
  
  const handleUpdateSettings = () => {
    const formData = new FormData();
    formData.append('assignment_name', values.assignmentName);
    formData.append('assignment_description', values.assignmentDescription);
    formData.append('submitted_by', values.submittedBy);
    formData.append('late_submitted', values.lateSubmitted ? 'true' : 'false');
    formData.append('group_submitted', values.groupSubmitted ? 'true' : 'false');
    formData.append('regrades', values.regrades ? 'true' : 'false');

    console.log('assignment_name:', values.assignmentName);
    console.log('assignment_description:', values.assignmentDescription);
    console.log('submitted_by:', values.submittedBy);
    console.log('late_submitted:', values.lateSubmitted);
    console.log('group_submitted:', values.groupSubmitted);
    console.log('regrades:', values.regrades);

    updateAssignment(
      { formData, course_id: course_id as string, assignment_id: assignment_id as string },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Assignment updated successfully',
            color: 'green',
          });
          reset();
          closeModal();
        },
        onError: (error) => {
          notifications.show({
              title: 'Upload Failed',
              message: `${error.response?.data?.error}`,
              color: 'red',
          });
          closeModal();
        },
      }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        closeModal();
      }}
      title="Edit assignment"
      size="55rem"
      h="auto"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateSettings();
        }}
      >
        <Tabs keepMounted={false} orientation="vertical" defaultValue="basic-settings" color="violet">
          <Flex w="100%" h="100%" gap="xs">
            <Tabs.List>
              <Tabs.Tab value="basic-settings" leftSection={icons.settings} classNames={{ tabLabel: 'flex justify-start text-left w-full' }}>
                Basic Settings
              </Tabs.Tab>
              <Tabs.Tab value="submission-settings" leftSection={icons.paper} classNames={{ tabLabel: 'flex justify-start text-left w-full' }}>
                Submission Settings
              </Tabs.Tab>
            </Tabs.List>          

            <Flex direction="column" w="100%" ml="md" mt="md">
              {/* Panels */}
              <Tabs.Panel value="basic-settings">
                <BasicSettings />
              </Tabs.Panel>
              <Tabs.Panel value="submission-settings">
                <SubmissionSettings />
              </Tabs.Panel>

              {/* Button Group - directly below content */}
              <Group mt="md" p="md" justify="end" gap="xs">
                <Button type="submit" disabled={isLoading} loading={isPending}>
                  Save
                </Button>
                <Button color="red" variant="outline" leftSection={icons.bin}>
                  Delete Assignment
                </Button>
              </Group>
            </Flex>
          </Flex>              
        </Tabs>
      </form>
    </Modal>
  );
};

export default AssignmentSetting;
