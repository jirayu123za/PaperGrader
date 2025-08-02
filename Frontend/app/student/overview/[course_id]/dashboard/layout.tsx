import React from 'react'
import LeftAssignment from '@/components/STD/SideBar/LeftCourse'

export default function StudentCourseDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <LeftAssignment/>
        <main className="flex-1">
          {children}
        </main>
    </div>
  )
}

