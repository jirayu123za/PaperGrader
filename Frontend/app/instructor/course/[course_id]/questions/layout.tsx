import React from 'react'
import LeftProcess from '@/components/LeftINS/LeftProcess'

export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <LeftProcess />
        <main className="grow">{children}</main>
    </div>
  )
}
