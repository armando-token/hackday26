import LocalizedClientLink from "@modules/common/components/localized-client-link"

const tiles = [
  {
    image: "/images/promo_valves.webp",
    title: "Heating & process control",
    subtitle: "Cartridges, band heaters, PIDs, and sensors in one catalog.",
    ctaHref: "/store/calefaccion-electrica",
  },
  {
    image: "/images/promo_support.webp",
    title: "Product technical support",
    subtitle: "Answers to common selection and installation questions.",
    ctaHref: "/store",
  },
  {
    image: "/images/promo_fluke.webp",
    title: "Downtime is not an option",
    subtitle: "Instrumentation and monitoring to keep your plant running.",
    ctaHref: "/store/control-e-indicacion",
  },
]

export default function HeroCarousel() {
  const supportTile = tiles[1]

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#CCCCCC]">
      <div className="hidden lg:grid max-w-[1440px] mx-auto grid-cols-3 gap-0 h-[180px]">
        {tiles.map((tile, idx) => (
          <LocalizedClientLink
            key={idx}
            href={tile.ctaHref}
            className={`relative h-full bg-cover bg-center border-r border-[#CCCCCC] block group overflow-hidden ${
              idx === 2 ? "border-r-0" : ""
            }`}
            style={{ backgroundImage: `url(${tile.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="relative p-4 flex flex-col justify-end h-full text-white z-10">
              <h3
                className="text-[16px] font-bold leading-tight group-hover:underline mb-0.5"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.85)" }}
              >
                {tile.title}
              </h3>
              <p
                className="text-[12px] text-white/95 line-clamp-2"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.85)" }}
              >
                {tile.subtitle}
              </p>
            </div>
          </LocalizedClientLink>
        ))}
      </div>

      {/* MOBILE: Only 'Soporte técnico' Card Centered */}
      <div className="lg:hidden w-full">
        <LocalizedClientLink
          href={supportTile.ctaHref}
          className="relative h-[180px] bg-cover bg-center block group overflow-hidden w-full"
          style={{ backgroundImage: `url(${supportTile.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          <div className="relative p-6 flex flex-col justify-center items-center text-center h-full text-white z-10">
            <h3
              className="text-[18px] font-bold leading-tight group-hover:underline mb-1.5"
              style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.9)" }}
            >
              {supportTile.title}
            </h3>
            <p
              className="text-[13px] text-white/95 max-w-[320px]"
              style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.9)" }}
            >
              {supportTile.subtitle}
            </p>
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
