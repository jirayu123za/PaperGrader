import React, { useEffect, useState } from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import UploadFiles from '@/components/INS/INSProcess/ManageScans/UploadFiles';
import { Loader, Tabs } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { StudentMatching } from '@/components/INS/INSProcess/ManageScans/StudentMatching';

type Props = {
    course_id: string;
    assignment_id: string;
};

export const INSManageScansPage: React.FC<Props> = ({ course_id, assignment_id }) => {
  const mounted = useMounted();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (mounted) {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [mounted]);

  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <div className="flex-grow p-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader size="lg" />
        </div>
      ) : (
        <Tabs defaultValue="manage-scans">
          <Tabs.List>
            <Tabs.Tab value="manage-scans">Manage Scans</Tabs.Tab>
            <Tabs.Tab value="manage-splits">Manage Splits</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="manage-scans" pt="md">
            <UploadFiles course_id={course_id} assignment_id={assignment_id}/>
          </Tabs.Panel>

          <Tabs.Panel value="manage-splits" pt="md">
            <StudentMatching course_id={course_id} assignment_id={assignment_id}/>
          </Tabs.Panel>
        </Tabs>
      )}
      </div>
    </div>
  );
}
