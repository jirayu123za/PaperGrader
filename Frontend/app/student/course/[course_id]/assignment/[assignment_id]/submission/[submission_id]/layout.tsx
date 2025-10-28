import React from 'react'
import LeftAssignment from '@/components/STD/SideBar/LeftCourse'
import { SidebarQuestions_STD } from '@/components/STD/SidebarQuestions'

export default function StudentAssignment({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
        <LeftAssignment/>
        <main className="grow overflow-hidden">{children}</main>
        <SidebarQuestions_STD />
    </div>
  )
}
