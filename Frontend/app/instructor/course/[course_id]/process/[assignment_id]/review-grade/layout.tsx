import React from "react";
import ReviewGradeBottomBar from "@/components/INS/INSProcess/Bottombar/ReviewGradeBottomBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <main className="pb-9">{children}</main>

      <footer className="fixed bottom-0 left-64 w-[calc(100%-16rem)] h-9 border-t border-gray-300 bg-white z-50 flex items-center pr-4 md:pr-6">
        <ReviewGradeBottomBar />
      </footer>
    </div>
  );
}
