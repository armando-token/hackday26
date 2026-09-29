import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="line-through text-gray-400 mr-2 text-[14px]"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
