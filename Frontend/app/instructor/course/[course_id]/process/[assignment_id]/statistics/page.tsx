import React from 'react';
import ReviewSummary from "@/components/INS/INSProcess/ReviewGrade/ReviewSummary";



export const metadata = {
  title: 'Review Grade',
  description: 'Review Grade for assignment.',
};


export default function InsStatistics() {
  return (
    <div className="flex min-h-screen">
      <div className="grow p-4">
        <ReviewSummary />
      </div>
    </div>
  );
}
