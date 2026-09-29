"use client"

import { useState } from "react"
import AmazonSideDrawer from "@modules/layout/components/amazon-side-drawer"

export default function NavTodosButton({
  categories,
}: {
  categories?: { name: string; href: string }[]
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center gap-1 font-bold px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer flex-shrink-0 select-none"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-[14px]">Todos</span>
      </button>

      {/* Amazon Left Side Drawer */}
      <AmazonSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories || []}
      />
    </>
  )
}

