import React from 'react'
import LeftAssignment from '@/components/STD/SideBar/LeftCourse'
import { SidebarSubmissionDetails } from '@/components/STD/Submission/SidebarQuestions'

export default function StudentAssignment({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
        <LeftAssignment/>
        <main className="grow overflow-hidden">{children}</main>
        <SidebarSubmissionDetails />
    </div>
  )
}
