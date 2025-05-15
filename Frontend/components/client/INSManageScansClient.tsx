"use client";
import INSManageScans from '@/components/INS/INSProcess/ManageScans/INSManageScans';
import { Tabs } from '@mantine/core';
import { ManageSplits } from '@/components/INS/INSProcess/ManageScans/ManageSplits';
import { ManageOCR } from '@/components/INS/INSProcess/ManageScans/ManageOCR';

export default function INSManageScansClient({ course_id, assignment_id }: { course_id: string; assignment_id: string;}) {
  return (
    <Tabs defaultValue="upload-files">
      <Tabs.List>
        <Tabs.Tab value="upload-files">Upload Files</Tabs.Tab>
        <Tabs.Tab value="manage-splits">Manage Splits</Tabs.Tab>
        <Tabs.Tab value="manage-ocr">Manage OCR</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upload-files" pt="md">
        <INSManageScans course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="manage-splits" pt="md">
        <ManageSplits course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="manage-ocr" pt="md">
        <ManageOCR course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>
    </Tabs>
  );
}
