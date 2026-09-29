"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState("")

  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImage(images[0].url || "")
    }
  }, [images])

  const handleThumbnailClick = (url: string) => {
    setActiveImage(url)
  }

  // Fallback if no images are present
  if (!images || images.length === 0) {
    return (
      <div className="border border-[#CCCCCC] w-full aspect-square bg-gray-50 flex items-center justify-center text-[#999999] text-[14px]">
        No Image Available
      </div>
    )
  }

  return (
    <div className="flex gap-4 w-full select-none font-[Arial,Helvetica,sans-serif]">
      {/* Vertical Thumbnails */}
      <div className="flex flex-col gap-2 w-[60px] flex-shrink-0">
        {images.map((image, index) => (
          <button
            key={image.id || index}
            onClick={() => handleThumbnailClick(image.url || "")}
            className={`w-[60px] h-[60px] border flex items-center justify-center p-1 bg-white hover:border-[#0066CC] transition-all duration-150 ${
              activeImage === image.url ? "border-2 border-[#0066CC]" : "border-[#CCCCCC]"
            }`}
          >
            {!!image.url && (
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Image Container */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[420px] aspect-square border border-[#CCCCCC] flex items-center justify-center p-4 bg-white relative overflow-hidden group">
          {activeImage && (
            <img
              src={activeImage}
              alt="Product Main"
              className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-110 cursor-zoom-in"
            />
          )}
        </div>
        <span className="text-[11px] text-[#666666] mt-2 block font-normal">Roll over image to zoom.</span>
        
        {/* Under image actions */}
        <div className="w-full max-w-[420px] flex items-center justify-between text-[12px] text-[#0066CC] mt-4 font-normal">
          <a
            href={`https://wa.me/51950302141?text=${encodeURIComponent("Hello Control Nautas, please send detailed images or specs for this industrial product.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            Request technical images
          </a>
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
