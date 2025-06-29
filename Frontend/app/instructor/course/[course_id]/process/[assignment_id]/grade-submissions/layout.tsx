import React from 'react'

export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <main className="grow">{children}</main>
    </div>
  )
}
