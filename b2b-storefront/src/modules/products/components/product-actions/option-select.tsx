import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-2 font-[Arial,Helvetica,sans-serif]">
      <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Seleccionar {title}</span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border text-[13px] h-9 px-3 rounded-none transition-colors duration-150 flex-1 min-w-[70px]",
                {
                  "border-[#0066CC] bg-white text-[#0066CC] font-bold ring-1 ring-[#0066CC]": isSelected,
                  "border-gray-300 bg-[#F9F9F9] text-gray-700 hover:border-gray-400 hover:bg-gray-100": !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
