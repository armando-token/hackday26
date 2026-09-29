import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import { getCatalogCategoryTree, getL1Families } from "@lib/catalog/catalog-category-tree"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ShellCartButton from "@modules/layout/components/shell-cart-button"
import Logo from "@modules/layout/components/logo"
import SearchBar from "@modules/layout/components/search-bar"
import NavTodosButton from "@modules/layout/components/nav-todos-button"
import MobileHeaderNav from "@modules/layout/components/mobile-header-nav"
import { company } from "@lib/config/company"

export default async function Nav() {
  try {
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions).catch(() => []),
      listLocales().catch(() => []),
      getLocale().catch(() => "dk"),
    ])
  } catch (e) {
    // Safe fallback if Medusa backend (port 9000) is offline/timing out
  }

  const tree = await getCatalogCategoryTree("pe").catch(() => null)
  const l1Families = tree ? getL1Families(tree) : []
  const categories = l1Families
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((c) => ({
      name: c.name,
      href: `/store/${c.slug}`,
      slug: c.slug,
    }))
  const searchCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
  }))

  return (
    <div className="w-full font-[Roboto,Arial,Helvetica,sans-serif] select-none">
      {/* DESKTOP HEADER - 100% Full Width */}
      <div className="hidden lg:block w-full min-w-[1024px] bg-[#131921] text-white">
        {/* Row 1: Main Header Bar (#131921) */}
        <div className="w-full h-[64px] px-2 xl:px-4 flex items-center justify-between gap-1 xl:gap-1.5 text-white border-b border-[#232F3E]">
          {/* 1. Control Nautas Brand Logo */}
          <Logo variant="desktop" />

          {/* 2. Search Bar - Maximized width across the entire middle section, expanding to the left directly next to Logo */}
          <div className="flex-1 min-w-0 ml-2 xl:ml-3 mr-1.5">
            <SearchBar
              className="h-[40px] w-full"
              categoryFamilies={searchCategories}
            />
          </div>

          {/* 4. Language Selector (ES / EN) */}
          <div className="flex items-center gap-1 px-1.5 py-2 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer flex-shrink-0 select-none">
            <span className="text-[13px]">🇵🇪</span>
            <span className="text-[13px] font-bold text-white">ES</span>
            <span className="text-[9px] text-[#A7ACB2]">▼</span>
          </div>

          {/* 5. Accounts & Lists */}
          <LocalizedClientLink
            href="/account"
            className="flex flex-col text-left leading-tight px-1.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm flex-shrink-0 select-none"
          >
            <span className="text-[11px] text-[#CCCCCC] font-normal">Hola, identifícate</span>
            <span className="text-[13px] font-bold text-white flex items-center gap-0.5 whitespace-nowrap">
              Cuenta y Listas <span className="text-[9px] text-[#A7ACB2]">▼</span>
            </span>
          </LocalizedClientLink>

          {/* 6. Returns & Orders */}
          <LocalizedClientLink
            href="/account/orders"
            className="flex flex-col text-left leading-tight px-1.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm flex-shrink-0 select-none"
          >
            <span className="text-[11px] text-[#CCCCCC] font-normal">Devoluciones</span>
            <span className="text-[13px] font-bold text-white whitespace-nowrap">y Pedidos</span>
          </LocalizedClientLink>

          {/* 7. Cart */}
          <div className="flex-shrink-0">
            <Suspense fallback={null}>
              <ShellCartButton showText={true} />
            </Suspense>
          </div>
        </div>

        {/* Row 2: Secondary Amazon Sub-Header (#232F3E) with ALL Product Categories */}
        <div className="w-full bg-[#232F3E] text-white h-[39px] px-3 flex items-center justify-between text-[13px] font-normal select-none">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar whitespace-nowrap flex-1 min-w-0 pr-2">
            {/* Amazon-style "Todos" Button with Left Side Drawer */}
            <NavTodosButton categories={categories} />

            {/* ALL Industrial Product Categories */}
            {categories.map((cat, idx) => (
              <LocalizedClientLink
                key={idx}
                href={cat.href}
                className="px-2.5 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm text-white hover:text-white font-medium"
              >
                {cat.name}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right Support Phone with Vibrating Handset Icon */}
          <a
            href={`tel:${company.phoneE164}`}
            className="hidden xl:flex items-center gap-1.5 font-bold text-[#FF9900] hover:underline cursor-pointer flex-shrink-0 pl-2 group select-none"
            title="Llamar a ventas y soporte telefónico"
          >
            <span className="inline-flex items-center justify-center animate-phone-vibrate text-[#FF9900]">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 3.93c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.55c0-.55-.45-1-1-1z" />
              </svg>
            </span>
            <span className="text-[12.5px] font-bold text-[#FF9900]">
              Tel: {company.phoneDisplay}
            </span>
          </a>
        </div>
      </div>

      <MobileHeaderNav
        categories={categories}
        searchCategories={searchCategories}
      />
    </div>
  )
}
