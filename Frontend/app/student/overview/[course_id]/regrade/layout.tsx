import React from 'react';
import LeftAssignment from '@/components/STD/SideBar/LeftCourse';

export default function StudentRegradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 🟣 Sidebar (ซ้าย) */}
      <LeftAssignment />

      {/* 🟣 Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
