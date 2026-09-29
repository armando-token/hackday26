"use client"

interface SubcatChipItem {
  id: string
  title: string
  count: number
  imageUrl?: string
}

interface MobileSubcatChipsProps {
  items: SubcatChipItem[]
  selectedGroup: string | null
  onSelectGroup: (groupId: string | null) => void
  totalCount: number
}

export default function MobileSubcatChips({
  items,
  selectedGroup,
  onSelectGroup,
  totalCount,
}: MobileSubcatChipsProps) {
  if (items.length <= 1) return null

  return (
    <div className="w-full bg-[#F8F9FA] border-b border-[#E5E5E5] py-2 px-3">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* "Todos" Chip */}
        <button
          type="button"
          onClick={() => onSelectGroup(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
            selectedGroup === null
              ? "bg-[#0066CC] text-white shadow-xs"
              : "bg-white text-[#333333] border border-[#D5D9D9] hover:bg-gray-100"
          }`}
        >
          <span>✦ Todas ({totalCount})</span>
        </button>

        {/* Subcategory Chips */}
        {items.map((item) => {
          const isSelected = selectedGroup === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectGroup(isSelected ? null : item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#0066CC] text-white font-bold shadow-xs"
                  : "bg-white text-[#333333] border border-[#D5D9D9] hover:bg-gray-100 font-medium"
              }`}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-4 h-4 object-contain rounded-xs"
                />
              )}
              <span>{item.title}</span>
              <span
                className={`text-[10.5px] ${
                  isSelected ? "text-blue-100" : "text-[#767676]"
                }`}
              >
                ({item.count})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
