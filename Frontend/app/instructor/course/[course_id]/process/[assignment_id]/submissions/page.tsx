"use client";

import { useEffect, useState } from 'react';
import { Tabs, Loader } from '@mantine/core';
import INSSubmissions from '@/components/INS/INSProcess/ManageSubmissions/INSSubmissions';
import INSSubmissionsQuestion from '@/components/INS/INSProcess/ManageSubmissions/INSSubmissionsQuesttion';

export default function Submissions() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex min-h-screen">

      {/* Main Content */}
      <div className="grow p-6">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader size="lg" />
          </div>
        ) : (
          <Tabs defaultValue="submissions">
            <Tabs.List>
              <Tabs.Tab value="submissions">Submissions list</Tabs.Tab>
              <Tabs.Tab value="questions">Questions list</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="submissions" pt="md">
              <INSSubmissions/>
            </Tabs.Panel>

            <Tabs.Panel value="questions" pt="md">
              <INSSubmissionsQuestion />
            </Tabs.Panel>
          </Tabs>
        )}
      </div>
    </div>
  );
}
