import React from 'react'
import LeftMain from '@/components/STD/SideBar/LeftMain'

export default function StudentCourse({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <LeftMain />
        <main className="flex-1">
          {children}
        </main>
    </div>
  )
}
