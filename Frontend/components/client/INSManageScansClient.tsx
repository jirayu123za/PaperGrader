"use client";
import UploadFiles from '@/components/INS/INSProcess/ManageScans/UploadFiles';
import { Tabs } from '@mantine/core';
import { StudentMatching } from '@/components/INS/INSProcess/ManageScans/StudentMatching';
import { ManageOCR } from '@/components/INS/INSProcess/ManageScans/ManageOCR';

export default function INSManageScansClient({ course_id, assignment_id }: { course_id: string; assignment_id: string;}) {
  return (
    <Tabs defaultValue="upload-files">
      <Tabs.List>
        <Tabs.Tab value="upload-files">Upload Files</Tabs.Tab>
        <Tabs.Tab value="student-matching">Student Matching</Tabs.Tab>
        <Tabs.Tab value="manage-ocr">Manage OCR</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upload-files" pt="md">
        <UploadFiles course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="student-matching" pt="md">
        <StudentMatching course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="manage-ocr" pt="md">
        <ManageOCR course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>
    </Tabs>
  );
}
