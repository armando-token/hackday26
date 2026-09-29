"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useShellLists } from "@lib/cn-catalog"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { list, toggleList } = useShellLists()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [deliveryMode, setDeliveryMode] = useState<"ship" | "pickup">("ship")
  const [zipCode, setZipCode] = useState("15072")
  const [isEditingZip, setIsEditingZip] = useState(false)
  const [tempZip, setTempZip] = useState("15072")
  
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  // Disparar GA4 view_item event en ProductActions
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).dataLayer && product) {
      ;(window as any).dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "PEN",
          value: selectedPriceValue?.calculated_price_number || 0,
          items: [
            {
              item_id: (product.metadata?.wc_id
                ? `gla_${product.metadata?.wc_id}`
                : product.handle) as string,
              item_name: product.title,
              item_brand: (product.metadata?.brand as string) || "Control Nautas",
              price: selectedPriceValue?.calculated_price_number || 0,
            },
          ],
        },
      })
    }
  }, [product.id])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    // Push GA4 add_to_cart event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      const numericPrice = selectedPriceValue?.calculated_price_number || 0
      ;(window as any).dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "PEN",
          value: numericPrice * quantity,
          items: [
            {
              item_id: (product.metadata?.wc_id
                ? `gla_${product.metadata?.wc_id}`
                : selectedVariant.sku || selectedVariant.id) as string,
              item_name: product.title,
              item_brand: (product.metadata?.brand as string) || "Control Nautas",
              price: numericPrice,
              quantity,
            },
          ],
        },
      })
    }

    setIsAdding(false)
  }

  // Fetch price directly
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })
  const selectedPrice = selectedVariant ? variantPrice : cheapestPrice
  const selectedPriceValue = selectedVariant ? variantPrice : cheapestPrice

  return (
    <div className="border border-[#CCCCCC] p-5 bg-white rounded-none select-none shadow-none flex flex-col gap-4 font-[Arial,Helvetica,sans-serif]">
      
      {/* 1. Variant Options Selection */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-4 border-b border-[#CCCCCC] pb-4 mb-2">
          {(product.options || []).map((option) => (
            <div key={option.id}>
              <OptionSelect
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                data-testid="product-options"
                disabled={!!disabled || isAdding}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. Web Price Header */}
      <div>
        <span className="text-[#666666] text-[12px] font-bold uppercase tracking-wide flex items-center gap-1">
          Precio Web
          <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#999999] text-[#666666] font-bold text-[9px] flex items-center justify-center cursor-help">i</span>
        </span>
        <div className="text-[#1E7E34] text-[28px] font-bold leading-tight mt-1 flex items-baseline gap-1">
          {selectedPriceValue ? (
            <span>{selectedPriceValue.calculated_price}</span>
          ) : (
            <span className="text-[#666666] text-base">Inicia sesión para ver precio</span>
          )}
          <span className="text-[12px] text-[#666666] font-normal">/ unidad</span>
        </div>
        {selectedPriceValue ? (
          <span className="text-[11px] font-semibold text-[#1E7E34] block mt-1">
            ✓ Entrega Inmediata
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-[#555555] block mt-1">
            ⏳ Vía Importación
          </span>
        )}
      </div>

      {/* Available Units Status Banner */}
      <div className="bg-[#e6f4ea] border border-[#a6d8b0] text-[#137333] p-3 text-[13px] flex items-start gap-2 rounded-none">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <div>
          <p className="font-bold">Disponible: {selectedVariant?.manage_inventory ? `${selectedVariant.inventory_quantity || 0} unidades` : "En stock"}</p>
          <p className="text-[11px] text-[#137333]/90 mt-0.5">¡Despacho hoy si pides antes de las 5 PM!</p>
        </div>
      </div>

      {/* 3. Quantity input block & Add to Cart (Same Row - h=40px) */}
      <div className="flex items-center gap-3 mt-2 h-10">
        <div className="relative border border-[#CCCCCC] rounded-none w-[90px] h-[40px] flex items-center justify-between focus-within:border-gray-500 bg-white">
          <label className="absolute -top-[7px] left-1 bg-white px-1 text-[9px] text-[#666666] font-bold uppercase leading-none">Cant.</label>
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-full flex items-center justify-center text-[#333333] hover:text-[#CC0000] font-bold pb-1 text-lg"
          >
            -
          </button>
          <input 
            type="text" 
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isAdding}
            className="w-full flex-1 text-[14px] font-bold focus:outline-none text-black text-center bg-transparent mt-1 p-0"
          />
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-full flex items-center justify-center text-[#333333] hover:text-[#CC0000] font-bold pb-1 text-lg"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          className="flex-1 bg-[#CC0000] hover:bg-[#C8102E] text-white text-[15px] font-bold h-[40px] rounded-none transition-colors uppercase disabled:bg-gray-300 disabled:cursor-not-allowed select-none tracking-wider flex items-center justify-center"
        >
          {isAdding
            ? "Añadiendo..."
            : !selectedVariant
            ? "Seleccionar variante"
            : !inStock || !isValidVariant
            ? "Sin stock"
            : "Añadir al carrito"}
        </button>
      </div>

      {/* 4. Ship / Pickup Toggle Tabs */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Ship Tab */}
        <button 
          onClick={() => setDeliveryMode("ship")}
          className={`border p-3 flex items-center gap-2 rounded-none text-left focus:outline-none transition-all ${
            deliveryMode === "ship" 
              ? "border-2 border-[#0066CC] bg-white" 
              : "border border-[#CCCCCC] bg-white hover:border-gray-400"
          }`}
        >
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            deliveryMode === "ship" ? "border-[#0066CC]" : "border-gray-400"
          }`}>
            {deliveryMode === "ship" && <div className="w-2 h-2 rounded-full bg-[#0066CC]"></div>}
          </div>
          <span className="text-[13px] font-bold text-gray-800">Envío a domicilio</span>
        </button>

        {/* Pickup Tab */}
        <button 
          onClick={() => setDeliveryMode("pickup")}
          className={`border p-3 flex items-center gap-2 rounded-none text-left focus:outline-none transition-all ${
            deliveryMode === "pickup" 
              ? "border-2 border-[#0066CC] bg-white" 
              : "border border-[#CCCCCC] bg-white hover:border-gray-400"
          }`}
        >
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            deliveryMode === "pickup" ? "border-[#0066CC]" : "border-gray-400"
          }`}>
            {deliveryMode === "pickup" && <div className="w-2 h-2 rounded-full bg-[#0066CC]"></div>}
          </div>
          <span className="text-[13px] font-bold text-gray-800">Recojo en sucursal</span>
        </button>
      </div>

      {/* Delivery Mode details */}
      {deliveryMode === "ship" ? (
        <div className="text-[13px] text-gray-700 bg-white p-3 border border-[#CCCCCC] rounded-none flex flex-col gap-2">
          {isEditingZip ? (
            <div className="flex gap-2 items-center h-10">
              <div className="relative border border-[#CCCCCC] rounded-none w-[100px] h-[40px] flex items-center justify-center focus-within:border-gray-500">
                <label className="absolute -top-[7px] left-1 bg-white px-1 text-[9px] text-[#666666] font-bold uppercase leading-none">Cód. Postal</label>
                <input 
                  type="text" 
                  value={tempZip} 
                  onChange={(e) => setTempZip(e.target.value)}
                  className="w-full text-[13px] font-bold focus:outline-none text-black text-center mt-1"
                />
              </div>
              <button 
                onClick={() => { setZipCode(tempZip); setIsEditingZip(false); }}
                className="bg-[#222222] hover:bg-[#333333] text-white text-[13px] font-bold px-4 h-[40px] rounded-none uppercase transition-colors"
              >
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[13px]">
              <span>Enviar a código postal <span className="font-bold text-[#333333]">{zipCode}</span>. </span>
              <button 
                onClick={() => setIsEditingZip(true)}
                className="text-[#0066CC] hover:underline font-bold"
              >
                Cambiar
              </button>
            </div>
          )}
          <div className="text-[#666666] text-[12px] flex flex-col gap-1 font-normal">
            <div>Peso de envío: <span className="font-bold text-gray-800">{product.weight ? `${product.weight} kg` : "0.82 kg"}</span></div>
            <LocalizedClientLink href="/entregas-y-devoluciones" className="text-[#0066CC] hover:underline mt-1 block">Términos de disponibilidad de envío</LocalizedClientLink>
          </div>
        </div>
      ) : (
        <div className="text-[13px] text-gray-700 bg-white p-3 border border-[#CCCCCC] rounded-none">
          <div className="font-bold text-gray-800">Recojo en Sede Central Jesús María</div>
          <p className="text-gray-500 text-[12px] mt-1">Previa confirmación de pedido y stock.</p>
          <LocalizedClientLink href="/contacto" className="text-[#0066CC] hover:underline font-bold text-[12px] mt-2 block">Ver dirección de sede central (Lima)</LocalizedClientLink>
        </div>
      )}

      {/* 5. Add to List Button */}
      <div className="border-t border-[#CCCCCC] pt-4 mt-2">
        <button
          type="button"
          onClick={() => product.handle && toggleList(product.handle)}
          className={`border text-[13px] font-bold w-full h-[36px] flex items-center justify-center transition-colors rounded-none uppercase tracking-wider select-none cursor-pointer ${
            product.handle && list.includes(product.handle)
              ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
              : "bg-white border-[#CCCCCC] text-[#0066CC] hover:bg-[#F2F2F2]"
          }`}
        >
          {product.handle && list.includes(product.handle)
            ? "✓ En mi Lista de Deseos"
            : "Añadir a mi Lista"}
        </button>
      </div>

    </div>
  )
}
