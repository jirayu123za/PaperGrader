"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import LeftMain from '@/components/LeftINS/LeftMain';
import LeftProcess from '@/components/LeftINS/LeftProcess';
import Create from '@/components/INS/INSProcess/Right/Create';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isInProcess = pathname.includes('/process/');
  const isInCreateOutline = pathname.includes('/create-outline');

  return (
    <div className="flex min-h-screen overflow-hidden">
      {isInProcess ? <LeftProcess /> : <LeftMain />}
        <div className="flex-grow">{children}</div>
      {isInCreateOutline && (
        <Create/>
      )}
    </div>
  );
}
