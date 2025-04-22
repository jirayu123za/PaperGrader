"use client";

import React from 'react';
import CourseRoster from '@/components/ManageRoster/CourseRoster';
import ManageSection from '@/components/ManageRoster/ManageSection';
import { Tabs } from '@mantine/core';

const ManageRoster: React.FC = () => {
  return (
    <div className="grow p-6">
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
  );
};

export default ManageRoster;
