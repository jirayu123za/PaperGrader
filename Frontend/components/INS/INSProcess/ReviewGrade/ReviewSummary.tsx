"use client";
import GradeStatistics from "./GradeStatistics";
import StudentTable from "./StudentTable";


export default function ReviewSummary() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]"> {/* สมมติ Header สูง 80px */}
      <div className="shrink-0">
        <GradeStatistics />
      </div>
      <div className="flex-1 min-h-0">
        <StudentTable />
      </div>
    </div>
  );
}
