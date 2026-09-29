import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import {
  ArrowPath,
  ArrowUpTray,
  Photo,
  Trash,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Skeleton,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { describeApiError, formatApiError, sdk } from "../lib/sdk"

/**
 * Widget de Imagen de Categoría para Medusa Admin.
 *
 * Permite a Marketing subir, reemplazar o eliminar la imagen de una categoría
 * directamente desde la vista de detalle de categoría en Medusa Admin.
 *
 * Persiste la URL en `product_category.metadata.image_url`.
 */

type CategoryData = {
  id: string
  name?: string
  handle?: string
  metadata?: Record<string, unknown> | null
}

const FALLBACK_SYSTEM_IMAGE = "/cn-media/categories/calefaccion-electrica.webp"
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".svg"]

const CategoryImageWidget = ({
  data,
}: DetailWidgetProps<CategoryData>) => {
  const categoryId = data?.id
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlEdit, setShowUrlEdit] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState("")
  const [imgLoadError, setImgLoadError] = useState(false)

  // Consulta de datos frescos de la categoría
  const {
    data: categoryDetails,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["category-details-image-widget", categoryId],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ product_category: CategoryData }>(
        `/admin/product-categories/${categoryId}?fields=id,name,handle,metadata`
      )
      return res.product_category
    },
    enabled: Boolean(categoryId),
    staleTime: 0,
  })

  const currentCategory = categoryDetails || data
  const currentMetadata = useMemo(
    () => (currentCategory?.metadata || {}) as Record<string, unknown>,
    [currentCategory?.metadata]
  )

  const savedImageUrl = useMemo(() => {
    const raw = currentMetadata?.image_url
    return typeof raw === "string" ? raw.trim() : ""
  }, [currentMetadata])

  // Sincronizar campo de texto cuando cambia la URL guardada
  useEffect(() => {
    setUrlInputValue(savedImageUrl)
    setImgLoadError(false)
  }, [savedImageUrl, categoryId])

  // Determinar la URL efectiva para previsualización
  const effectivePreviewUrl = useMemo(() => {
    if (showUrlEdit && urlInputValue.trim()) {
      return urlInputValue.trim()
    }
    if (savedImageUrl) {
      return savedImageUrl
    }
    return FALLBACK_SYSTEM_IMAGE
  }, [showUrlEdit, urlInputValue, savedImageUrl])

  useEffect(() => {
    setImgLoadError(false)
  }, [effectivePreviewUrl])

  // Mutación para actualizar metadata
  const updateMetadataMutation = useMutation({
    mutationFn: async (newImageUrl: string | null) => {
      const nextMetadata: Record<string, unknown> = {
        ...currentMetadata,
      }

      if (newImageUrl && newImageUrl.trim() !== "") {
        nextMetadata.image_url = newImageUrl.trim()
      } else {
        nextMetadata.image_url = null
      }

      return sdk.client.fetch<{ product_category: CategoryData }>(
        `/admin/product-categories/${categoryId}`,
        {
          method: "POST",
          body: {
            metadata: nextMetadata,
          },
        }
      )
    },
    onSuccess: async (_, newImageUrl) => {
      await queryClient.invalidateQueries({
        queryKey: ["category-details-image-widget", categoryId],
      })
      await queryClient.invalidateQueries({
        queryKey: ["product-category", categoryId],
      })
      await queryClient.invalidateQueries({
        queryKey: ["product-categories"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      })

      if (newImageUrl && newImageUrl.trim() !== "") {
        toast.success("Imagen guardada", {
          description: "La imagen de la categoría se ha actualizado correctamente.",
        })
      } else {
        toast.success("Imagen eliminada", {
          description: "Se ha removido la imagen de Medusa; ahora usará la imagen por defecto.",
        })
      }
    },
    onError: (err) => {
      const info = describeApiError(err)
      toast.error("Error al guardar imagen", {
        description: formatApiError(info),
      })
    },
  })

  // Subir archivo al backend File Module
  const handleUploadFile = async (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Formato no compatible", {
        description: `Formatos permitidos: ${ALLOWED_EXTENSIONS.join(", ")}.`,
      })
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      toast.error("Archivo demasiado grande", {
        description: `El archivo seleccionado pesa ${mb}MB. El tamaño máximo recomendado es de 2MB.`,
      })
      return
    }

    setIsUploading(true)
    try {
      const uploadRes = await sdk.admin.upload.create({ files: [file] })
      const uploadedFile = uploadRes?.files?.[0]
      const fileUrl = uploadedFile?.url

      if (!fileUrl) {
        throw new Error("El servidor no devolvió una URL válida para el archivo.")
      }

      // Guardar automáticamente en el metadata de la categoría
      await updateMetadataMutation.mutateAsync(fileUrl)
    } catch (err: unknown) {
      const info = describeApiError(err)
      toast.error("Error al subir imagen", {
        description: formatApiError(info),
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Manejo de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleUploadFile(files[0])
    }
  }

  const isSaving = updateMetadataMutation.isPending
  const isBusy = isUploading || isSaving

  // Estado del Badge
  let badgeLabel = "Sin imagen"
  let badgeColor: "green" | "orange" | "grey" = "grey"

  if (savedImageUrl) {
    badgeLabel = "Imagen oficial Medusa"
    badgeColor = "green"
  } else if (!imgLoadError && effectivePreviewUrl) {
    badgeLabel = "Imagen por defecto (sistema)"
    badgeColor = "orange"
  }

  return (
    <Container className="divide-y p-0">
      {/* Cabecera del widget */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Imagen de Categoría</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Esta imagen se muestra en la portada, catálogo y cabecera de la categoría.
          </Text>
        </div>
        {isFetching && !isLoading && (
          <ArrowPath className="animate-spin text-ui-fg-muted size-4 shrink-0" />
        )}
      </div>

      {/* Vista previa visual 1:1 */}
      <div className="flex flex-col items-center gap-3 px-6 py-5">
        <div className="relative flex aspect-square w-48 items-center justify-center overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-inner">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : imgLoadError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Photo className="text-ui-fg-muted mb-2 size-8" />
              <Text size="xsmall" className="text-ui-fg-muted">
                No se pudo cargar la imagen
              </Text>
            </div>
          ) : (
            <img
              src={effectivePreviewUrl}
              alt={currentCategory?.name || "Categoría"}
              className="h-full w-full object-contain p-2"
              onError={() => setImgLoadError(true)}
            />
          )}

          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-ui-bg-base/70 backdrop-blur-xs">
              <ArrowPath className="animate-spin text-ui-fg-base size-6" />
            </div>
          )}
        </div>

        {/* Badge de estado */}
        <Badge size="small" color={badgeColor}>
          {badgeLabel}
        </Badge>

        {/* URL actual */}
        {savedImageUrl ? (
          <Text
            size="xsmall"
            className="text-ui-fg-muted max-w-full truncate text-center"
            title={savedImageUrl}
          >
            {savedImageUrl}
          </Text>
        ) : null}
      </div>

      {/* Zona de carga y edición */}
      <div className="flex flex-col gap-4 px-6 py-4">
        {/* Drop zone / Input de archivo */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isBusy && fileInputRef.current?.click()}
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
            isDragging
              ? "border-ui-border-interactive bg-ui-bg-interactive-subtle"
              : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-base"
          } ${isBusy ? "pointer-events-none opacity-60" : ""}`}
        >
          <ArrowUpTray className="text-ui-fg-subtle mb-1 size-5" />
          <Text size="small" weight="plus">
            {isUploading
              ? "Subiendo archivo..."
              : isSaving
              ? "Guardando categoría..."
              : "Arrastra una imagen aquí o haz clic"}
          </Text>
          <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
            WebP, JPG, PNG o SVG (máx. 2MB)
          </Text>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".webp,.jpg,.jpeg,.png,.svg"
            disabled={isBusy}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleUploadFile(e.target.files[0])
              }
            }}
          />
        </div>

        {/* Edición directa de URL */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowUrlEdit(!showUrlEdit)}
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover self-start text-xs font-medium underline"
          >
            {showUrlEdit ? "Ocultar edición manual de URL" : "O ingresar URL / ruta manualmente"}
          </button>

          {showUrlEdit && (
            <div className="mt-1 flex flex-col gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle p-3">
              <Label size="xsmall" weight="plus">
                Ruta o URL de la imagen
              </Label>
              <Input
                size="small"
                placeholder="/cn-media/categories/... o https://..."
                value={urlInputValue}
                disabled={isBusy}
                onChange={(e) => setUrlInputValue(e.target.value)}
              />
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={isSaving}
                  disabled={isBusy || urlInputValue.trim() === savedImageUrl}
                  onClick={() => updateMetadataMutation.mutate(urlInputValue.trim())}
                >
                  Guardar imagen
                </Button>
                {urlInputValue.trim() !== savedImageUrl && (
                  <Button
                    size="small"
                    variant="transparent"
                    disabled={isBusy}
                    onClick={() => {
                      setUrlInputValue(savedImageUrl)
                      setImgLoadError(false)
                    }}
                  >
                    Restablecer
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón de eliminar imagen oficial */}
        {savedImageUrl ? (
          <div className="flex justify-end pt-1">
            <Button
              size="small"
              variant="danger"
              isLoading={isSaving}
              disabled={isBusy}
              onClick={() => updateMetadataMutation.mutate(null)}
              className="flex items-center gap-1.5"
            >
              <Trash className="size-4" />
              <span>Eliminar imagen</span>
            </Button>
          </div>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.side.before",
})

export default CategoryImageWidget
