import Create from '@/components/INS/INSProcess/Right/Create'
import React from 'react'

export default function SubmissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <main className="grow overflow-hidden">{children}</main>
      {/* <Create /> */}
    </div>
  )
}
