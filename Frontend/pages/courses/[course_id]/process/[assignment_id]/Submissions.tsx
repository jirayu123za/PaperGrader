import { useEffect, useState } from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSSubmissions from '../../../../../components/INS/INSProcess/ManageSubmissions/INSSubmissions';
import INSSubmissionsQuestion from '../../../../../components/INS/INSProcess/ManageSubmissions/INSSubmissionsQuesttion';
import { Tabs, Loader } from '@mantine/core';

export default function Submissions() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading for demonstration
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <LeftProcess />

      {/* Main Content */}
      <div className="flex-grow p-4">
        <h2 className="mb-4">Manage Submissions</h2>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader size="lg" />
          </div>
        ) : (
          <Tabs defaultValue="submissions">
            <Tabs.List>
              <Tabs.Tab value="submissions">Submissions</Tabs.Tab>
              <Tabs.Tab value="questions">Questions</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="submissions" pt="md">
              <INSSubmissions onViewPDF={() => { }} />
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
