import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404 - Cart not found | Control Nautas",
  description: "The cart you tried to open does not exist.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Cart not found</h1>
      <p className="text-small-regular text-ui-fg-base">
        The cart you tried to open does not exist or has expired. Browse the catalog to add items.
      </p>
      <InteractiveLink href="/">Back to home</InteractiveLink>
    </div>
  )
}
