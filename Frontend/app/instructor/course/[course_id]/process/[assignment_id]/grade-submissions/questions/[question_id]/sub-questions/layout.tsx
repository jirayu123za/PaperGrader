import React from 'react'
import GradeBottomBar from "@/components/INS/INSProcess/Bottombar/GradeBottomBar";


export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <main>{children}</main>
        <footer
        className="fixed bottom-0 left-64 w-[calc(100%-16rem)] border-t border-gray-300 bg-white z-50"
        style={{
          padding: "0.1rem",
        }}
      >
        <GradeBottomBar />
      </footer>
    </>
  )
}

