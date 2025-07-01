import React from "react";
import { SidebarQuestions } from "@/components/INS/INSProcess/Right/Grade/SidebarQuestions";

export default function GradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      <SidebarQuestions />
    </div>
  );
}
