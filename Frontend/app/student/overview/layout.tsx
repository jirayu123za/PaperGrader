import React from 'react'

export default function StudentDashBoard({ children }: { children: React.ReactNode })  {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
