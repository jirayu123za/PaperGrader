'use client'

import { Tabs } from '@mantine/core'
import React from 'react'
import CourseRoster from '@/components/ManageRoster/CourseRoster'
import ManageSection from '@/components/ManageRoster/ManageSection'

export const ManageRosterClient = () => {
  return (
    <div className="grow p-4">
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
    </div>
  )
}
