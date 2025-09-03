"use client";

import '@mantine/dates/styles.css';
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import SectionEditAssignment from "@/components/Create/Sections/SectionEditAssignment";
import { Button, Flex, Modal, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DateTimePicker } from "@mantine/dates";
import { useParams } from "next/navigation";
import { LuClock } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { useAssignmentSettingFormStore, useAssignmentSettingStore } from "@/store/modal/useAssignmentSettingModal";
import { useUpdateAssignmentTimeSettings } from "@/hooks/AssignmentSetting/updateAssignmentTimeSettings";
import { useModalAssignmentTimeSettingStore } from "@/store/modal/useAssignmentTimeSettingModal";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

export const TimeSetting: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;

  const icons = { clock: <LuClock />, bin: <RiDeleteBinLine /> };
  const { values, reset } = useAssignmentSettingFormStore();
  const { selectedSectionIDs } = useAssignmentSettingStore();
  const { assignment_id, opened, closeModal } = useModalAssignmentTimeSettingStore();
  const { mutate: updateAssignmentTimeSettings, isPending } = useUpdateAssignmentTimeSettings();
  
  const handleUpdateTimeSetting = () => {
    const formData = new FormData();
    formData.append('release_date', values.releaseDate ? dayjs(values.releaseDate).tz().format() : '');
    formData.append('due_date', values.dueDate ? dayjs(values.dueDate).tz().format() : '');
    formData.append('cut_off_date', values.cutOffDate ? dayjs(values.cutOffDate).tz().format() : '');
    formData.append('sections', JSON.stringify(selectedSectionIDs));
    // Debugging logs
    console.log('release_date:', values.releaseDate ? dayjs(values.releaseDate).tz().format() : '');
    console.log('due_date:', values.dueDate ? dayjs(values.dueDate).tz().format() : '');
    console.log('cut_off_date:', values.cutOffDate ? dayjs(values.cutOffDate).tz().format() : '');
    console.log('sections:', JSON.stringify(selectedSectionIDs));
    
    // Implement the API call to update the time settings
    updateAssignmentTimeSettings({
        timeData: formData,
        course_id: course_id as string,
        assignment_id: assignment_id as string 
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Time settings updated successfully',
            color: 'green',
          });
          closeModal();
        },
        onError: (error) => {
          notifications.show({
            title: 'Update failed',
            message: `${error.response?.data?.error}`,
            color: 'red',
          });
          closeModal();
        }
      }
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        closeModal();
      }}
      title="Edit time settings each section"
      size="40rem"
      h="auto"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form
        
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateTimeSetting();
        }}
      >
        <Flex direction="column" m="md">
          {/* Button Group - directly below content */}
          <SectionEditAssignment />

          <Flex gap="md">
            <DateTimePicker
              style={{ flex: 1 }}
              label="Release date"
              placeholder="Select release date"
              value={values.releaseDate || null}
              onChange={(date) => {
                useAssignmentSettingFormStore
                  .getState()
                  .setField("releaseDate", date);
              }}
              valueFormat="DD/MM/YYYY HH:mm A"
              timePickerProps={{
                withDropdown: true,
                popoverProps: { withinPortal: false },
                format: "12h",
              }}
            />
            <DateTimePicker
              style={{ flex: 1 }}
              label="Due date"
              placeholder="Select due date"
              value={values.dueDate || null}
              onChange={(date) => {
                useAssignmentSettingFormStore
                  .getState()
                  .setField("dueDate", date);
              }}
              valueFormat="DD/MM/YYYY HH:mm A"
              timePickerProps={{
                withDropdown: true,
                popoverProps: { withinPortal: false },
                format: "12h",
              }}
            />
          </Flex>
          <DateTimePicker
            label="Cut off date"
            placeholder="Select cut off date"
            value={values.cutOffDate || null}
            onChange={(date) => {
              useAssignmentSettingFormStore
                .getState()
                .setField("cutOffDate", date);
            }}
            valueFormat="DD/MM/YYYY HH:mm A"
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
          />
          <Group mt="md" justify="end" gap="xs">
            <Button type="submit" loading={isPending}>
              Update assignment
            </Button>
            <Button color="red" variant="outline" leftSection={icons.bin}>
              Delete assignment
            </Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  );
};
