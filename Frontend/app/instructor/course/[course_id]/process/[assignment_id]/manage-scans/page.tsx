"use client";

import React, { useEffect, useState } from 'react';

import INSManageScans from '@/components/INS/INSProcess/ManageScans/INSManageScans';
import { Loader, Tabs } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { ManageSplits } from '@/components/INS/INSProcess/ManageScans/ManageSplits';

export default function INSManageScansPage() {
  const mounted = useMounted();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (mounted) {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [mounted]);

  return (
    <div className="flex min-h-screen">
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
            <INSManageScans />
          </Tabs.Panel>

          <Tabs.Panel value="manage-splits" pt="md">
            <ManageSplits />
          </Tabs.Panel>
        </Tabs>
      )}
      </div>
    </div>
  );
}
