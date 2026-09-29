"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"
import SearchBar from "@modules/layout/components/search-bar"
import ShellCartButton from "@modules/layout/components/shell-cart-button"
import AmazonSideDrawer from "@modules/layout/components/amazon-side-drawer"

export default function MobileHeaderNav({
  categories,
  searchCategories = [],
}: {
  categories: { name: string; href: string }[]
  searchCategories?: { name: string; slug: string }[]
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="block lg:hidden w-full font-[Roboto,Arial,Helvetica,sans-serif] select-none bg-[#131921] text-white">
      {/* Top Row: Hamburger + Logo + Sign in + Cart */}
      <div className="h-[52px] px-2.5 flex items-center justify-between gap-1.5">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-white p-1 hover:opacity-80 cursor-pointer flex items-center justify-center"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Logo variant="mobile" />
        </div>

        {/* Right: User account icon + Cart */}
        <div className="flex items-center gap-3">
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-1 text-[13px] text-white font-normal hover:underline p-1 cursor-pointer"
            aria-label="My Account / Sign in"
          >
            <span className="text-[13px] font-normal text-white">Ingresar ›</span>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </LocalizedClientLink>

          <div className="flex-shrink-0">
            <ShellCartButton showText={false} />
          </div>
        </div>
      </div>

      {/* Row 2: Search Bar (Clean full-width input without left category box on mobile) */}
      <div className="px-3 pb-2.5 pt-0.5">
        <SearchBar
          className="h-[42px] w-full"
          showCategorySelector={false}
          categoryFamilies={searchCategories}
        />
      </div>

      {/* Row 3: Horizontal Subnav Category Bar */}
      <div className="bg-[#232F3E] px-3.5 py-2 flex items-center gap-4 text-[13px] text-white font-medium overflow-x-auto no-scrollbar whitespace-nowrap border-b border-[#2A3849]">
        {categories.map((cat, idx) => (
          <LocalizedClientLink key={idx} href={cat.href} className="hover:underline text-white font-medium">
            {cat.name}
          </LocalizedClientLink>
        ))}
      </div>

      {/* Row 4: Delivery Location Bar */}
      <div className="bg-[#1F2A37] px-3.5 py-2 text-[12.5px] flex items-center text-[#CCCCCC]">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-white font-normal">Ship to United States (USD)</span>
        </div>
      </div>

      {/* Amazon Side Drawer Modal */}
      <AmazonSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
      />
    </div>
  )
}
