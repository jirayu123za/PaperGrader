"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import LeftMain from '@/components/LeftINS/LeftMain';
import LeftProcess from '@/components/LeftINS/LeftProcess'; // ✅ เปลี่ยนตาม path ที่คุณเก็บไว้

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isInProcess = pathname.includes('/process/');

  return (
    <div className="flex min-h-screen">
      {isInProcess ? <LeftProcess /> : <LeftMain />}
      <div className="flex-grow">{children}</div>
    </div>
  );
}
