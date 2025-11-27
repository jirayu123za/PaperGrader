import React from "react";
import ReviewGradeBottomBar from "@/components/INS/INSProcess/Bottombar/ReviewGradeBottomBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {children}
      </main>

      <footer className="mt-auto h-10 border-t border-gray-300 bg-white flex items-center px-4">
        <ReviewGradeBottomBar />
      </footer>
    </div>
  );
}
