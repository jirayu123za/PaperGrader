import { useEffect, useState } from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSSubmissions from '../../../../../components/INS/INSProcess/ManageSubmissions/INSSubmissions';
import INSSubmissionsQuestion from '../../../../../components/INS/INSProcess/ManageSubmissions/INSSubmissionsQuesttion';
import { Button, Flex } from '@mantine/core';

export default function Submissions() {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeComponent, setActiveComponent] = useState<'submissions' | 'questions'>('submissions');

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <LeftProcess />

      {/* Main Content */}
      <div className="flex-grow p-4">
        <Flex justify="space-between" align="center" mb="md">
          <h2>Manage Submissions</h2>
          <Button
            onClick={() =>
              setActiveComponent(activeComponent === 'submissions' ? 'questions' : 'submissions')
            }
          >
            {activeComponent === 'submissions' ? 'Switch to Questions' : 'Switch to Submissions'}
          </Button>
        </Flex>

        {/* Loading Spinner */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {activeComponent === 'submissions' ? (
              <INSSubmissions onViewPDF={() => { }} />
            ) : (
              <INSSubmissionsQuestion />
            )}
          </>
        )}
      </div>
    </div>
  );
}
