'use client'

import { Tabs } from '@mantine/core';
import { INSSubmissions } from '@/components/INS/INSProcess/ManageSubmissions/INSSubmissions';
import { INSSubmissionsQuestion } from '@/components/INS/INSProcess/ManageSubmissions/INSSubmissionsQuestion';

export const TabsGradeSubmissionsClient = () => {
  return (
    <Tabs defaultValue="submissions" p="md">
      <Tabs.List>
        <Tabs.Tab value="submissions">Submissions view</Tabs.Tab>
        <Tabs.Tab value="questions">Questions view</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="submissions" pt="md">
        <INSSubmissions/>
      </Tabs.Panel>

      <Tabs.Panel value="questions">
        <INSSubmissionsQuestion />
      </Tabs.Panel>
    </Tabs>
  )
}
