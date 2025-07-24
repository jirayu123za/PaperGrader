"use client";
import GradeStatistics from "./AssignmentStatistics";
import { RubricTable }from "./RubricTable";


export default function ReviewSummary() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]"> 
      <div className="shrink-0">
        <GradeStatistics scores={[]} />
      </div>
      <div className="flex-1 min-h-0">
         < RubricTable  />
      </div>
    </div>
  );
}
