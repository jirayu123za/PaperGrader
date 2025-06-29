import Create from '@/components/INS/INSProcess/Right/Create'
import { RubricGrader } from '@/components/INS/INSProcess/Right/Grade/RubricGrader'
import React from 'react'

export default function SubmissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      {/* <Create /> */}
      <RubricGrader />
    </div>
  )
}
