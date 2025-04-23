"use client";
import INSManageScans from '@/components/INS/INSProcess/ManageScans/INSManageScans';
import { Tabs } from '@mantine/core';
import { ManageSplits } from '@/components/INS/INSProcess/ManageScans/ManageSplits';

export default function INSManageScansClient({ course_id, assignment_id }: { course_id: string; assignment_id: string;}) {
  return (
    <Tabs defaultValue="manage-scans">
      <Tabs.List>
        <Tabs.Tab value="manage-scans">Manage Scans</Tabs.Tab>
        <Tabs.Tab value="manage-splits">Manage Splits</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="manage-scans" pt="md">
        <INSManageScans course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>

      <Tabs.Panel value="manage-splits" pt="md">
        <ManageSplits course_id={course_id} assignment_id={assignment_id} />
      </Tabs.Panel>
    </Tabs>
  );
}
