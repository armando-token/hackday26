import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Migra las URLs de imágenes de categorías desde category-images.json
 * hacia product_category.metadata.image_url en Medusa.
 *
 * Uso:
 *   Dry-run:
 *     npm run catalog:migrate-category-images
 *     npx medusa exec ./src/scripts/migrate-category-images.ts
 *
 *   Aplicar cambios:
 *     npm run catalog:migrate-category-images:apply
 *     npx medusa exec ./src/scripts/migrate-category-images.ts apply
 */

function resolveCategoryImagesPath(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), "../../../b2b-storefront/src/lib/cn-catalog/data/category-images.json"),
    path.resolve(__dirname, "../../../../../b2b-storefront/src/lib/cn-catalog/data/category-images.json"),
    path.resolve(process.cwd(), "../../b2b-storefront/src/lib/cn-catalog/data/category-images.json"),
    "/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/category-images.json",
  ]

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error(
    `category-images.json no encontrado. Se verificaron las rutas:\n${candidatePaths.join("\n")}`
  )
}

function loadCategoryImages(): Record<string, string> {
  const filePath = resolveCategoryImagesPath()
  const raw = fs.readFileSync(filePath, "utf8")
  return JSON.parse(raw) as Record<string, string>
}

export default async function migrateCategoryImages({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const logger = container.resolve("logger")

  const isApply =
    process.argv.includes("apply") || process.argv.includes("--apply")

  console.log("=".repeat(70))
  console.log(
    `MIGRACIÓN DE IMÁGENES DE CATEGORÍA A MEDUSA METADATA [${
      isApply ? "APPLY" : "DRY-RUN"
    }]`
  )
  console.log(`Fecha: ${new Date().toISOString()}`)
  console.log("=".repeat(70))

  const categoryImages = loadCategoryImages()
  const jsonHandleCount = Object.keys(categoryImages).length
  console.log(`📦 Leídas ${jsonHandleCount} asignaciones desde category-images.json`)

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name", "metadata"],
    pagination: { take: 1000, skip: 0 },
  })

  const totalCategories = categories?.length || 0
  console.log(`🔍 Encontradas ${totalCategories} categorías en la base de datos de Medusa\n`)

  let matchedCount = 0
  let toUpdateCount = 0
  let alreadySetCount = 0
  let unmatchedCount = 0
  const updatedCategories: Array<{ id: string; handle: string; imageUrl: string }> = []

  for (const category of categories || []) {
    const cat = category as {
      id: string
      handle: string
      name: string
      metadata?: Record<string, unknown> | null
    }

    const expectedImageUrl = categoryImages[cat.handle]

    if (!expectedImageUrl) {
      unmatchedCount++
      continue
    }

    matchedCount++
    const currentMetadata = (cat.metadata || {}) as Record<string, unknown>
    const currentImageUrl = currentMetadata.image_url

    if (currentImageUrl === expectedImageUrl) {
      alreadySetCount++
      continue
    }

    toUpdateCount++
    console.log(
      `${isApply ? "✅ [APPLY]" : "🔍 [DRY-RUN]"} ${cat.handle} (${cat.id})`
    )
    console.log(`   Actual:   ${currentImageUrl ? JSON.stringify(currentImageUrl) : "null"}`)
    console.log(`   Objetivo: "${expectedImageUrl}"`)

    if (isApply) {
      try {
        await productModule.updateProductCategories(cat.id, {
          metadata: {
            ...currentMetadata,
            image_url: expectedImageUrl,
          },
        })
        updatedCategories.push({
          id: cat.id,
          handle: cat.handle,
          imageUrl: expectedImageUrl,
        })
      } catch (err: any) {
        logger.error(
          `Error actualizando categoría ${cat.handle} (${cat.id}): ${err?.message || err}`
        )
      }
    }
  }

  console.log("\n" + "=".repeat(70))
  console.log("RESUMEN DE MIGRACIÓN")
  console.log("=".repeat(70))
  console.log(`Total categorías en DB:                 ${totalCategories}`)
  console.log(`Total handles en category-images.json:  ${jsonHandleCount}`)
  console.log(`Coincidencias encontradas:              ${matchedCount}`)
  console.log(`Ya actualizadas previamente:            ${alreadySetCount}`)
  console.log(
    `${isApply ? "Categorías actualizadas en DB:" : "Categorías pendientes por actualizar:"} ${toUpdateCount}`
  )
  console.log(`Categorías DB sin imagen en JSON:       ${unmatchedCount}`)
  console.log("=".repeat(70))

  if (!isApply && toUpdateCount > 0) {
    console.log(
      "\n💡 Para persistir los cambios en la base de datos, ejecuta:\n   npm run catalog:migrate-category-images:apply\n"
    )
  } else if (isApply) {
    console.log(
      `\n✨ Migración completada exitosamente. ${updatedCategories.length} categorías actualizadas.`
    )
  }
}
