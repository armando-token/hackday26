"use client"

interface MobileToolbarProps {
  onOpenFilter: () => void
  onOpenSort: () => void
  activeFilterCount: number
  currentSortLabel?: string
  totalCount: number
}

export default function MobileToolbar({
  onOpenFilter,
  onOpenSort,
  activeFilterCount,
  currentSortLabel = "Destacados",
  totalCount,
}: MobileToolbarProps) {
  return (
    <div className="w-full bg-white border-b border-[#E5E5E5] sticky top-0 z-30 shadow-xs font-[Arial,Helvetica,sans-serif]">
      {/* Dual Action Toolbar (Filtrar + Ordenar) */}
      <div className="flex items-center h-[42px] bg-[#FDFDFD]">
        {/* Filter Button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="flex-1 h-full flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#0F1111] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#0F1111]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.25 5.61C6.57 8.59 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.43-4.41 5.75-7.39C20.26 4.95 19.79 4 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z" />
          </svg>
          <span>Filtrar</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#0066CC] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-[24px] bg-[#E0E0E0]" />

        {/* Sort Button */}
        <button
          type="button"
          onClick={onOpenSort}
          className="flex-1 h-full flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#0F1111] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#0F1111]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
          </svg>
          <span>Ordenar</span>
          <span className="text-[11px] font-normal text-[#565959] truncate max-w-[100px]">
            ({currentSortLabel})
          </span>
        </button>
      </div>

      {/* Product Count Bar */}
      <div className="px-3 py-1 bg-[#F7F8F9] border-t border-[#EEEEEE] text-[11.5px] text-[#565959] flex items-center justify-between">
        <span>
          Mostrando <strong className="text-[#0F1111]">{totalCount}</strong> productos industriales
        </span>
        {activeFilterCount > 0 && (
          <span className="text-[#0066CC] font-semibold">Filtros aplicados</span>
        )}
      </div>
    </div>
  )
}
