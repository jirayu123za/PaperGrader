"use client";
import UploadFiles from '@/components/INS/INSProcess/ManageScans/UploadFiles';
import { Tabs } from '@mantine/core';
import { StudentMatching } from '@/components/INS/INSProcess/ManageScans/StudentMatching';

export default function INSManageScansClient({ course_id, assignment_id }: { course_id: string; assignment_id: string;}) {
  return (
    <Tabs defaultValue="upload-files">
      <Tabs.List>
        <Tabs.Tab value="upload-files">1.Upload Files</Tabs.Tab>
        <Tabs.Tab value="student-matching">2.Student Matching</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upload-files" pt="md">
        <UploadFiles course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="student-matching" pt="md">
        <StudentMatching course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>
    </Tabs>
  );
}
