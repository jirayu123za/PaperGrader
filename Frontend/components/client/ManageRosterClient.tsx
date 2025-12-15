'use client'

import { Tabs } from '@mantine/core'
import React from 'react'
import CourseRoster from '@/components/INS/INSManageRoster/CourseRoster'
import ManageSection from '@/components/INS/INSManageRoster/ManageSection'

export const ManageRosterClient = () => {
  return (
      <Tabs defaultValue="roster">
        <Tabs.List>
          <Tabs.Tab value="roster">Manage roster</Tabs.Tab>
          <Tabs.Tab value="section">Manage section</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="roster">
          <CourseRoster />
        </Tabs.Panel>
        <Tabs.Panel value="section">
          <ManageSection />
        </Tabs.Panel>
      </Tabs>
  )
}
