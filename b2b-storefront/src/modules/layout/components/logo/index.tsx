import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

interface LogoProps {
  className?: string
  imageClassName?: string
  theme?: "dark" | "light"
  variant?: "desktop" | "mobile" | "footer" | "checkout" | "auth"
  linkHref?: string
}

export default function Logo({
  className = "",
  imageClassName = "",
  theme = "dark",
  variant = "desktop",
  linkHref = "/",
}: LogoProps) {
  // theme === "dark"  -> fondo oscuro -> /images/logo/control_nautas_logo_white.webp
  // theme === "light" -> fondo claro  -> /images/logo/control_nautas_logo_fondo_blanco.webp
  const src =
    theme === "dark"
      ? "/images/logo/control_nautas_logo_white.webp"
      : "/images/logo/control_nautas_logo_fondo_blanco.webp"

  // Specific sizing based on container variant
  const sizeStyles = {
    desktop: "h-[40px] xl:h-[42px] max-h-[44px] w-auto max-w-[195px]",
    mobile: "h-[34px] max-h-[36px] w-auto max-w-[170px]",
    footer: "h-[42px] max-h-[45px] w-auto max-w-[200px]",
    checkout: "h-[38px] max-h-[42px] w-auto max-w-[190px]",
    auth: "h-[50px] sm:h-[54px] max-h-[58px] w-auto max-w-[230px]",
  }[variant]

  const hoverOutline =
    theme === "dark"
      ? "hover:outline hover:outline-1 hover:outline-white/70"
      : "hover:opacity-90"

  return (
    <LocalizedClientLink
      href={linkHref}
      className={`inline-flex items-center px-1 py-0.5 rounded-sm flex-shrink-0 cursor-pointer transition-all ${hoverOutline} ${className}`}
      aria-label="Control Nautas - Inicio"
    >
      <img
        src={src}
        alt="Control Nautas"
        className={`object-contain block ${sizeStyles} ${imageClassName}`}
        loading={variant === "desktop" || variant === "mobile" ? "eager" : "lazy"}
      />
    </LocalizedClientLink>
  )
}
