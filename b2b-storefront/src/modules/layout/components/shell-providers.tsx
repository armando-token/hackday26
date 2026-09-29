"use client"

import { ShellCartProvider, ShellListsProvider } from "@lib/cn-catalog"

export default function ShellProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellCartProvider>
      <ShellListsProvider>{children}</ShellListsProvider>
    </ShellCartProvider>
  )
}
