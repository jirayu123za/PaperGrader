import React from 'react'

export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <main className="grow p-4">{children}</main>
    </div>
  )
}
