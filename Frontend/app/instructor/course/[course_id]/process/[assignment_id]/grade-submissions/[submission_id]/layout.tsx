import React from "react";

export default function GradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">
        {children}
      </main>
      {/* ก้อนสีเทาทางขวา */}
      <aside className="w-80 bg-gray-100 border-l border-gray-300 p-4">
        {/* Component ที่จะใส่ภายหลัง */}
      </aside>
    </div>
  );
}
