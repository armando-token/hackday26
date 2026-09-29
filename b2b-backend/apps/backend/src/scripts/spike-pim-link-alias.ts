import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Spike de contrato: determina el alias real que Query genera para el enlace
 * inverso read-only Product -> PimInfo.
 *
 * Plan maestro, secciones 5.2 y 18 (Fase 2, paso 1). El alias NO se asume por
 * intuicion: el resultado de este script es el que congela el contrato del
 * storefront. Solo lee.
 *
 *   npx medusa exec ./src/scripts/spike-pim-link-alias.ts
 */
export default async function spikePimLinkAlias({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const candidatos = ["pim_info", "pimInfo", "pim_infos", "pimInfoes", "b2b_pim_pim_info"]
  const resultados: Array<{ alias: string; ok: boolean; detalle: string }> = []

  console.log("=".repeat(70))
  console.log("SPIKE — alias del enlace Product -> PimInfo")
  console.log("=".repeat(70))

  for (const alias of candidatos) {
    try {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "handle", `${alias}.*`],
        filters: { status: "published" },
        pagination: { take: 1, skip: 0 },
      })
      const row: any = data?.[0]
      const valor = row ? row[alias] : undefined
      const hidratado =
        valor && (Array.isArray(valor) ? valor.length > 0 : !!valor.id)
      resultados.push({
        alias,
        ok: true,
        detalle: hidratado
          ? `HIDRATADO (${Array.isArray(valor) ? "array" : "objeto"})`
          : "acepta el campo pero devuelve vacio",
      })
      console.log(
        `[OK]   ${alias.padEnd(20)} ${
          hidratado ? "HIDRATADO" : "vacio"
        } ${Array.isArray(valor) ? "(array)" : valor ? "(objeto)" : ""}`
      )
      if (hidratado) {
        const muestra = Array.isArray(valor) ? valor[0] : valor
        console.log(`       handle=${row.handle}`)
        console.log(`       campos=${Object.keys(muestra).join(", ")}`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      resultados.push({ alias, ok: false, detalle: msg })
      console.log(`[FAIL] ${alias.padEnd(20)} ${msg.slice(0, 90)}`)
    }
  }

  const ganador = resultados.find((r) => r.ok && r.detalle.startsWith("HIDRATADO"))
  console.log("=".repeat(70))
  if (ganador) {
    console.log(`ALIAS CONFIRMADO: ${ganador.alias}`)
    console.log("El contrato del storefront debe usar exactamente este alias.")
  } else {
    console.log("NINGUN ALIAS HIDRATA.")
    console.log("Aplica la puerta de contingencia del plan (seccion 5.2):")
    console.log("ruta de composicion en Medusa reutilizando query config y pricingContext.")
  }
  console.log("=".repeat(70))
}
