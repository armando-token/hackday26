/**
 * Bloquea scripts de migración/seed legacy salvo confirmación explícita (Fase 7).
 */
export function assertDestructiveLegacyAllowed(scriptName: string): void {
  if (process.env.ALLOW_DESTRUCTIVE_LEGACY_SEED === "1") {
    return
  }
  console.error("")
  console.error(`⛔ ABORT: ${scriptName} está bloqueado.`)
  console.error("   Scripts legacy pueden sobrescribir el catálogo Medusa.")
  console.error(
    "   Para ejecutar en entorno controlado: ALLOW_DESTRUCTIVE_LEGACY_SEED=1"
  )
  console.error("")
  process.exit(1)
}
