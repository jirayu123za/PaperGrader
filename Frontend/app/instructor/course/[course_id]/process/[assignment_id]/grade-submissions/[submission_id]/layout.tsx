import React from "react";
import { RubricGrader } from "@/components/INS/INSProcess/Right/Grade/RubricGrader";

export default function GradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      {/* <Create /> */}
      <RubricGrader />
    </div>
  );
}
