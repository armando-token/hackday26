import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404 - Página no encontrada | Control Nautas",
  description: "La página solicitada no existe o ha sido movida.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Página no encontrada</h1>
      <p className="text-small-regular text-ui-fg-base">
        La página a la que intentas acceder no existe o fue trasladada.
      </p>
      <InteractiveLink href="/">Ir a la página principal</InteractiveLink>
    </div>
  )
}
