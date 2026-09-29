import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404 - Carrito no encontrado | Control Nautas",
  description: "El carrito al que intentas acceder no existe.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Carrito no encontrado</h1>
      <p className="text-small-regular text-ui-fg-base">
        El carrito al que intentas acceder no existe o ha expirado. Por favor, explora nuestro catálogo para añadir nuevos ítems.
      </p>
      <InteractiveLink href="/">Volver al inicio</InteractiveLink>
    </div>
  )
}
