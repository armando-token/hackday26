import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Skeleton,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { describeApiError, formatApiError, sdk } from "../lib/sdk"

/**
 * Widget PIM del detalle de producto (plan maestro, secciones 10.2 a 10.4).
 *
 * Reemplaza la version anterior, que usaba `window.fetch` sin JWT (401
 * silenciosos por `.catch(() => {})`), exponia solo 9 de los 16 campos
 * editables y mostraba las especificaciones como tabla de solo lectura.
 */

// ------------------------------------------------------------------ tipos

const PURCHASE_MODES = [
  { value: "buy_now", label: "Comprar directo (con precio)" },
  { value: "quote_only", label: "Solo cotizacion" },
  { value: "contact_for_price", label: "Consultar precio" },
  { value: "made_to_order", label: "Fabricacion a medida (B2B)" },
] as const

const AVAILABILITY_MODES = [
  { value: "in_stock", label: "En stock (entrega inmediata)" },
  { value: "lead_time", label: "Bajo pedido (con plazo de entrega)" },
  { value: "made_to_order", label: "Fabricacion a pedido" },
  { value: "discontinued", label: "Descontinuado" },
] as const

type PurchaseMode = (typeof PURCHASE_MODES)[number]["value"]
type AvailabilityMode = (typeof AVAILABILITY_MODES)[number]["value"]

/** Limites del validador del servidor (src/api/.../pim/validators.ts). */
const SEO_TITLE_RECOMENDADO = 70
const SEO_TITLE_MAX = 320
const SEO_DESCRIPTION_RECOMENDADA = 170
const SEO_DESCRIPTION_MAX = 400
const LEAD_TIME_MIN = 1
const LEAD_TIME_MAX = 3650
const MAX_SPEC_ENTRIES = 100
const MAX_SPEC_KEY_LENGTH = 120
const MAX_SPEC_VALUE_LENGTH = 2000

type SpecRow = { id: string; key: string; value: string }

type PimForm = {
  mfr_model: string
  item_number: string
  purchase_mode: PurchaseMode
  availability_mode: AvailabilityMode
  lead_time_days: string
  technical_pdf: string
  manual_pdf: string
  og_image: string
  ip_certification: string
  voltage: string
  thread_size: string
  material: string
  oem_brand: string
  seo_title: string
  seo_description: string
  specs: SpecRow[]
}

type PimInfo = {
  id?: string
  updated_at?: string
  [key: string]: unknown
}

type PimResponse = { pim_info: PimInfo | null }

// ------------------------------------------------------------- utilidades

let contadorFilas = 0
const nuevaFilaId = () => `spec_${++contadorFilas}`

const texto = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v)

const FORM_VACIO: PimForm = {
  mfr_model: "",
  item_number: "",
  purchase_mode: "buy_now",
  availability_mode: "in_stock",
  lead_time_days: "",
  technical_pdf: "",
  manual_pdf: "",
  og_image: "",
  ip_certification: "",
  voltage: "",
  thread_size: "",
  material: "",
  oem_brand: "",
  seo_title: "",
  seo_description: "",
  specs: [],
}

function aFormulario(info: PimInfo | null | undefined): PimForm {
  if (!info) {
    return { ...FORM_VACIO, specs: [] }
  }

  const specsCrudas = (info.specs ?? {}) as Record<string, unknown>
  const specs: SpecRow[] =
    specsCrudas && typeof specsCrudas === "object" && !Array.isArray(specsCrudas)
      ? Object.entries(specsCrudas).map(([key, value]) => ({
          id: nuevaFilaId(),
          key,
          value: texto(value),
        }))
      : []

  const purchase = texto(info.purchase_mode) as PurchaseMode
  const availability = texto(info.availability_mode) as AvailabilityMode

  return {
    mfr_model: texto(info.mfr_model),
    item_number: texto(info.item_number),
    purchase_mode: PURCHASE_MODES.some((m) => m.value === purchase)
      ? purchase
      : "buy_now",
    availability_mode: AVAILABILITY_MODES.some((m) => m.value === availability)
      ? availability
      : "in_stock",
    lead_time_days: texto(info.lead_time_days),
    technical_pdf: texto(info.technical_pdf),
    manual_pdf: texto(info.manual_pdf),
    og_image: texto(info.og_image),
    ip_certification: texto(info.ip_certification),
    voltage: texto(info.voltage),
    thread_size: texto(info.thread_size),
    material: texto(info.material),
    oem_brand: texto(info.oem_brand),
    seo_title: texto(info.seo_title),
    seo_description: texto(info.seo_description),
    specs,
  }
}

const aNulo = (v: string): string | null => {
  const t = v.trim()
  return t === "" ? null : t
}

/** Solo se envian las 16 claves editables: el schema es `.strict()`. */
function aPayload(form: PimForm): Record<string, unknown> {
  const specs: Record<string, string> = {}
  for (const fila of form.specs) {
    const key = fila.key.trim()
    const value = fila.value.trim()
    if (key && value) {
      specs[key] = value
    }
  }

  return {
    mfr_model: aNulo(form.mfr_model),
    item_number: aNulo(form.item_number),
    purchase_mode: form.purchase_mode,
    availability_mode: form.availability_mode,
    // El servidor rechaza un plazo declarado fuera del estado "lead_time".
    lead_time_days:
      form.availability_mode === "lead_time" && form.lead_time_days.trim() !== ""
        ? Number(form.lead_time_days.trim())
        : null,
    technical_pdf: aNulo(form.technical_pdf),
    manual_pdf: aNulo(form.manual_pdf),
    og_image: aNulo(form.og_image),
    ip_certification: aNulo(form.ip_certification),
    voltage: aNulo(form.voltage),
    thread_size: aNulo(form.thread_size),
    material: aNulo(form.material),
    oem_brand: aNulo(form.oem_brand),
    seo_title: aNulo(form.seo_title),
    seo_description: aNulo(form.seo_description),
    specs,
  }
}

/** Comparacion estable para detectar cambios reales. */
function firma(form: PimForm): string {
  return JSON.stringify({
    ...aPayload(form),
    // Se incluyen las filas tal cual para que reordenar cuente como cambio.
    __orden: form.specs.map((f) => [f.key.trim(), f.value.trim()]),
  })
}

const esUrlValida = (v: string): boolean => {
  const t = v.trim()
  return t === "" || t.startsWith("/") || t.startsWith("https://")
}

type Errores = Record<string, string>

function validar(form: PimForm): { errores: Errores; specErrores: Record<string, string> } {
  const errores: Errores = {}
  const specErrores: Record<string, string> = {}

  const maximos: Array<[keyof PimForm, number, string]> = [
    ["mfr_model", 200, "Modelo de fabrica"],
    ["item_number", 100, "Numero de item"],
    ["ip_certification", 100, "Certificacion IP"],
    ["voltage", 100, "Voltaje"],
    ["thread_size", 100, "Rosca / conexion"],
    ["material", 200, "Material"],
    ["oem_brand", 200, "Marca OEM"],
    ["seo_title", SEO_TITLE_MAX, "Titulo SEO"],
    ["seo_description", SEO_DESCRIPTION_MAX, "Descripcion SEO"],
  ]

  for (const [campo, max, etiqueta] of maximos) {
    const valor = form[campo]
    if (typeof valor === "string" && valor.trim().length > max) {
      errores[campo] = `${etiqueta}: maximo ${max} caracteres.`
    }
  }

  for (const campo of ["technical_pdf", "manual_pdf", "og_image"] as const) {
    if (!esUrlValida(form[campo])) {
      errores[campo] = "Debe ser una ruta que empiece con / o una URL https://"
    }
  }

  if (form.availability_mode === "lead_time" && form.lead_time_days.trim() !== "") {
    const n = Number(form.lead_time_days.trim())
    if (!Number.isInteger(n) || n < LEAD_TIME_MIN || n > LEAD_TIME_MAX) {
      errores.lead_time_days = `Debe ser un numero entero entre ${LEAD_TIME_MIN} y ${LEAD_TIME_MAX}.`
    }
  }

  const vistas = new Map<string, string>()
  for (const fila of form.specs) {
    const key = fila.key.trim()
    const value = fila.value.trim()

    if (!key) {
      specErrores[fila.id] = "La clave no puede estar vacia."
      continue
    }
    if (!value) {
      specErrores[fila.id] = "El valor no puede estar vacio."
      continue
    }
    if (key.length > MAX_SPEC_KEY_LENGTH) {
      specErrores[fila.id] = `La clave supera ${MAX_SPEC_KEY_LENGTH} caracteres.`
      continue
    }
    if (value.length > MAX_SPEC_VALUE_LENGTH) {
      specErrores[fila.id] = `El valor supera ${MAX_SPEC_VALUE_LENGTH} caracteres.`
      continue
    }

    const normalizada = key.toLowerCase()
    const previa = vistas.get(normalizada)
    if (previa) {
      specErrores[fila.id] = `Clave duplicada (coincide con "${previa}" al normalizar).`
      continue
    }
    vistas.set(normalizada, key)
  }

  if (form.specs.length > MAX_SPEC_ENTRIES) {
    errores.specs = `Maximo ${MAX_SPEC_ENTRIES} especificaciones.`
  }

  return { errores, specErrores }
}

// ------------------------------------------------------------ subcomponentes

const MensajeError = ({ texto: mensaje }: { texto?: string }) =>
  mensaje ? (
    <Text size="xsmall" className="text-ui-fg-error mt-1">
      {mensaje}
    </Text>
  ) : null

const CampoTexto = ({
  id,
  etiqueta,
  valor,
  onChange,
  placeholder,
  error,
  ayuda,
}: {
  id: string
  etiqueta: string
  valor: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  ayuda?: string
}) => (
  <div className="flex flex-col">
    <Label htmlFor={id} size="xsmall" weight="plus">
      {etiqueta}
    </Label>
    <Input
      id={id}
      className="mt-1"
      value={valor}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
    {ayuda && !error ? (
      <Text size="xsmall" className="text-ui-fg-subtle mt-1">
        {ayuda}
      </Text>
    ) : null}
    <MensajeError texto={error} />
  </div>
)

const ContadorSeo = ({
  largo,
  recomendado,
  maximo,
}: {
  largo: number
  recomendado: number
  maximo: number
}) => {
  if (largo > maximo) {
    return (
      <Badge size="2xsmall" color="red">
        {largo}/{maximo} — supera el limite permitido
      </Badge>
    )
  }
  if (largo > recomendado) {
    return (
      <Badge size="2xsmall" color="orange">
        {largo}/{recomendado} recomendados — se puede guardar igualmente
      </Badge>
    )
  }
  return (
    <Badge size="2xsmall" color="green">
      {largo}/{recomendado} recomendados
    </Badge>
  )
}

// ------------------------------------------------------------------ widget

const ProductPimWidget = ({ data }: DetailWidgetProps<{ id: string }>) => {
  const productId = data?.id
  const queryClient = useQueryClient()

  const [form, setForm] = useState<PimForm>(FORM_VACIO)
  const [firmaBase, setFirmaBase] = useState<string>(() => firma(FORM_VACIO))
  const [erroresServidor, setErroresServidor] = useState<Record<string, string[]>>({})
  /** Ultimo registro volcado al formulario, para no pisar ediciones en curso. */
  const ultimaSincronizacion = useRef<string | null>(null)
  /**
   * Salvaguarda contra perdida de datos: mientras el formulario no se haya
   * poblado desde una respuesta real del servidor, guardar enviaria campos
   * vacios y borraria el registro existente. Sin esta bandera, un fallo de
   * sincronizacion se convierte en un DELETE silencioso de los datos PIM.
   */
  const [sincronizado, setSincronizado] = useState(false)

  // Al cambiar de producto el formulario deja de reflejar datos del servidor.
  useEffect(() => {
    setSincronizado(false)
    ultimaSincronizacion.current = null
  }, [productId])

  const consulta = useQuery({
    queryKey: ["product-pim", productId],
    queryFn: () =>
      sdk.client.fetch<PimResponse>(`/admin/products/${productId}/pim`, {
        method: "GET",
      }),
    enabled: Boolean(productId),
    // Sin `keepPreviousData`: al ser un formulario por producto, conservar el
    // dato anterior marca la consulta como exitosa con contenido que no
    // corresponde al producto abierto, y el formulario se sincroniza en vacio.
    staleTime: 0,
    retry: (intentos, error) => {
      const { status } = describeApiError(error)
      if (status === 401 || status === 403 || status === 404 || status === 409) {
        return false
      }
      return intentos < 2
    },
  })

  const registro = consulta.data?.pim_info ?? null

  useEffect(() => {
    if (!consulta.isSuccess) {
      return
    }
    const clave = `${productId}:${registro?.id ?? "nuevo"}:${
      registro?.updated_at ?? ""
    }`
    if (ultimaSincronizacion.current === clave) {
      return
    }
    ultimaSincronizacion.current = clave
    const siguiente = aFormulario(registro)
    setSincronizado(true)
    setForm(siguiente)
    setFirmaBase(firma(siguiente))
    setErroresServidor({})
  }, [consulta.isSuccess, productId, registro])

  const { errores, specErrores } = useMemo(() => validar(form), [form])
  const hayErrores =
    Object.keys(errores).length > 0 || Object.keys(specErrores).length > 0
  const hayCambios = useMemo(() => firma(form) !== firmaBase, [form, firmaBase])

  const mutacion = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      sdk.client.fetch<PimResponse>(`/admin/products/${productId}/pim`, {
        // PUT es el upsert idempotente preferido por la API.
        method: "PUT",
        body: payload,
      }),
    onSuccess: (respuesta) => {
      setErroresServidor({})
      const persistido = respuesta?.pim_info ?? null
      if (persistido) {
        const siguiente = aFormulario(persistido)
        setForm(siguiente)
        setFirmaBase(firma(siguiente))
        ultimaSincronizacion.current = `${productId}:${persistido.id ?? "nuevo"}:${
          persistido.updated_at ?? ""
        }`
      }
      toast.success("Datos PIM guardados", {
        description: "La informacion tecnica y SEO se actualizo correctamente.",
      })
      queryClient.invalidateQueries({ queryKey: ["product-pim", productId] })
    },
    onError: (error) => {
      const info = describeApiError(error)
      setErroresServidor(info.fieldErrors)
      toast.error("No se pudo guardar", { description: formatApiError(info) })
    },
  })

  const actualizar = useCallback(
    <K extends keyof PimForm>(campo: K, valor: PimForm[K]) => {
      setForm((prev) => ({ ...prev, [campo]: valor }))
      setErroresServidor((prev) => {
        if (!(campo in prev)) {
          return prev
        }
        const copia = { ...prev }
        delete copia[campo as string]
        return copia
      })
    },
    []
  )

  const errorDe = (campo: keyof PimForm): string | undefined =>
    errores[campo as string] ?? erroresServidor[campo as string]?.join(" ")

  // --------------------------------------------------------- specs (editor)

  const agregarSpec = () =>
    setForm((prev) => ({
      ...prev,
      specs: [...prev.specs, { id: nuevaFilaId(), key: "", value: "" }],
    }))

  const editarSpec = (id: string, campo: "key" | "value", valor: string) =>
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)),
    }))

  const eliminarSpec = (id: string) =>
    setForm((prev) => ({ ...prev, specs: prev.specs.filter((f) => f.id !== id) }))

  const moverSpec = (indice: number, delta: number) =>
    setForm((prev) => {
      const destino = indice + delta
      if (destino < 0 || destino >= prev.specs.length) {
        return prev
      }
      const specs = [...prev.specs]
      const [fila] = specs.splice(indice, 1)
      specs.splice(destino, 0, fila)
      return { ...prev, specs }
    })

  // ------------------------------------------------------------- acciones

  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !productId ||
      !sincronizado ||
      mutacion.isPending ||
      !hayCambios ||
      hayErrores
    ) {
      return
    }
    mutacion.mutate(aPayload(form))
  }

  const descartar = () => {
    const siguiente = aFormulario(registro)
    setForm(siguiente)
    setFirmaBase(firma(siguiente))
    setErroresServidor({})
  }

  // -------------------------------------------------------------- estados

  const encabezado = (
    <div className="flex items-start justify-between px-6 py-4">
      <div>
        <Heading level="h2">Control Nautas — PIM industrial y SEO</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Especificaciones tecnicas, modalidad comercial, documentacion y
          metadatos para buscadores.
        </Text>
      </div>
      {consulta.isFetching && !consulta.isPending ? (
        <Badge size="2xsmall" color="grey">
          Actualizando...
        </Badge>
      ) : null}
    </div>
  )

  if (consulta.isPending) {
    return (
      <Container className="divide-y p-0">
        {encabezado}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Container>
    )
  }

  if (consulta.isError) {
    const info = describeApiError(consulta.error)
    return (
      <Container className="divide-y p-0">
        {encabezado}
        <div className="flex flex-col items-start gap-y-3 px-6 py-6">
          <Badge size="2xsmall" color="red">
            Error {info.status ?? ""}
          </Badge>
          <Text size="small" className="text-ui-fg-error">
            {formatApiError(info)}
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {info.status === 409
              ? "No reintente hasta revisar los registros PIM duplicados de este producto."
              : "No se pudieron cargar los datos PIM de este producto."}
          </Text>
          {info.status !== 409 ? (
            <Button
              size="small"
              variant="secondary"
              onClick={() => consulta.refetch()}
              isLoading={consulta.isFetching}
            >
              Reintentar
            </Button>
          ) : null}
        </div>
      </Container>
    )
  }

  const esNuevo = !registro

  return (
    <Container className="divide-y p-0">
      {encabezado}

      <form onSubmit={guardar}>
        {esNuevo ? (
          <div className="px-6 py-3">
            <Text size="small" className="text-ui-fg-subtle">
              Este producto todavia no tiene ficha PIM. Complete los campos y
              guarde para crearla.
            </Text>
          </div>
        ) : null}

        {/* Identificacion */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Heading level="h3">Identificacion</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CampoTexto
              id="pim-mfr-model"
              etiqueta="Modelo de fabrica"
              valor={form.mfr_model}
              onChange={(v) => actualizar("mfr_model", v)}
              placeholder="Ej: N1200-USB"
              error={errorDe("mfr_model")}
            />
            <CampoTexto
              id="pim-item-number"
              etiqueta="Numero de item / catalogo"
              valor={form.item_number}
              onChange={(v) => actualizar("item_number", v)}
              placeholder="Ej: 8804131101"
              error={errorDe("item_number")}
            />
            <CampoTexto
              id="pim-oem-brand"
              etiqueta="Marca OEM / fabricante"
              valor={form.oem_brand}
              onChange={(v) => actualizar("oem_brand", v)}
              placeholder="Ej: NOVUS, Horner"
              error={errorDe("oem_brand")}
            />
          </div>
        </div>

        {/* Comercial */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Heading level="h3">Modalidad comercial y disponibilidad</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <Label size="xsmall" weight="plus">
                Modalidad comercial
              </Label>
              <Select
                value={form.purchase_mode}
                onValueChange={(v) => actualizar("purchase_mode", v as PurchaseMode)}
              >
                <Select.Trigger className="mt-1">
                  <Select.Value placeholder="Seleccione una modalidad" />
                </Select.Trigger>
                <Select.Content>
                  {PURCHASE_MODES.map((m) => (
                    <Select.Item key={m.value} value={m.value}>
                      {m.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <MensajeError texto={errorDe("purchase_mode")} />
            </div>

            <div className="flex flex-col">
              <Label size="xsmall" weight="plus">
                Disponibilidad
              </Label>
              <Select
                value={form.availability_mode}
                onValueChange={(v) => {
                  const modo = v as AvailabilityMode
                  setForm((prev) => ({
                    ...prev,
                    availability_mode: modo,
                    // Un plazo fuera de "lead_time" es un dato contradictorio
                    // y el servidor lo rechaza con 400.
                    lead_time_days: modo === "lead_time" ? prev.lead_time_days : "",
                  }))
                }}
              >
                <Select.Trigger className="mt-1">
                  <Select.Value placeholder="Seleccione la disponibilidad" />
                </Select.Trigger>
                <Select.Content>
                  {AVAILABILITY_MODES.map((m) => (
                    <Select.Item key={m.value} value={m.value}>
                      {m.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <MensajeError texto={errorDe("availability_mode")} />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="pim-lead-time" size="xsmall" weight="plus">
                Plazo de entrega (dias)
              </Label>
              <Input
                id="pim-lead-time"
                className="mt-1"
                inputMode="numeric"
                value={form.lead_time_days}
                disabled={form.availability_mode !== "lead_time"}
                placeholder={
                  form.availability_mode === "lead_time" ? "Ej: 30" : "No aplica"
                }
                onChange={(e) => actualizar("lead_time_days", e.target.value)}
              />
              <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                {form.availability_mode !== "lead_time"
                  ? "Solo se puede definir con disponibilidad \u201cBajo pedido\u201d."
                  : form.lead_time_days.trim() === ""
                  ? "Opcional: si se deja vacio, la tienda mostrara \u201cConsultar plazo\u201d."
                  : `Entre ${LEAD_TIME_MIN} y ${LEAD_TIME_MAX} dias.`}
              </Text>
              <MensajeError texto={errorDe("lead_time_days")} />
            </div>
          </div>
        </div>

        {/* Atributos tecnicos */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Heading level="h3">Atributos tecnicos</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <CampoTexto
              id="pim-ip"
              etiqueta="Certificacion IP"
              valor={form.ip_certification}
              onChange={(v) => actualizar("ip_certification", v)}
              placeholder="Ej: IP67"
              error={errorDe("ip_certification")}
            />
            <CampoTexto
              id="pim-voltage"
              etiqueta="Voltaje"
              valor={form.voltage}
              onChange={(v) => actualizar("voltage", v)}
              placeholder="Ej: 100-240 VAC"
              error={errorDe("voltage")}
            />
            <CampoTexto
              id="pim-thread"
              etiqueta="Rosca / conexion"
              valor={form.thread_size}
              onChange={(v) => actualizar("thread_size", v)}
              placeholder='Ej: 1/2" NPT'
              error={errorDe("thread_size")}
            />
            <CampoTexto
              id="pim-material"
              etiqueta="Material"
              valor={form.material}
              onChange={(v) => actualizar("material", v)}
              placeholder="Ej: Acero inoxidable 316"
              error={errorDe("material")}
            />
          </div>
        </div>

        {/* Documentacion */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Heading level="h3">Documentacion e imagenes</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CampoTexto
              id="pim-technical-pdf"
              etiqueta="Ficha tecnica (PDF)"
              valor={form.technical_pdf}
              onChange={(v) => actualizar("technical_pdf", v)}
              placeholder="/docs/ficha.pdf o https://..."
              ayuda="Ruta local (/) o URL https://"
              error={errorDe("technical_pdf")}
            />
            <CampoTexto
              id="pim-manual-pdf"
              etiqueta="Manual de usuario (PDF)"
              valor={form.manual_pdf}
              onChange={(v) => actualizar("manual_pdf", v)}
              placeholder="/docs/manual.pdf o https://..."
              ayuda="Ruta local (/) o URL https://"
              error={errorDe("manual_pdf")}
            />
            <CampoTexto
              id="pim-og-image"
              etiqueta="Imagen para redes (og:image)"
              valor={form.og_image}
              onChange={(v) => actualizar("og_image", v)}
              placeholder="/img/producto.jpg o https://..."
              ayuda="Ruta local (/) o URL https://"
              error={errorDe("og_image")}
            />
          </div>
        </div>

        {/* SEO */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <Heading level="h3">Optimizacion para buscadores</Heading>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-x-2">
              <Label htmlFor="pim-seo-title" size="xsmall" weight="plus">
                Titulo SEO
              </Label>
              <ContadorSeo
                largo={form.seo_title.trim().length}
                recomendado={SEO_TITLE_RECOMENDADO}
                maximo={SEO_TITLE_MAX}
              />
            </div>
            <Input
              id="pim-seo-title"
              className="mt-1"
              value={form.seo_title}
              placeholder="Titulo que aparecera en los resultados de busqueda"
              onChange={(e) => actualizar("seo_title", e.target.value)}
            />
            <MensajeError texto={errorDe("seo_title")} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-x-2">
              <Label htmlFor="pim-seo-description" size="xsmall" weight="plus">
                Descripcion SEO
              </Label>
              <ContadorSeo
                largo={form.seo_description.trim().length}
                recomendado={SEO_DESCRIPTION_RECOMENDADA}
                maximo={SEO_DESCRIPTION_MAX}
              />
            </div>
            <Textarea
              id="pim-seo-description"
              className="mt-1"
              rows={3}
              value={form.seo_description}
              placeholder="Resumen que aparecera bajo el titulo en los resultados"
              onChange={(e) => actualizar("seo_description", e.target.value)}
            />
            <MensajeError texto={errorDe("seo_description")} />
          </div>
        </div>

        {/* Specs */}
        <div className="flex flex-col gap-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h3">Especificaciones tecnicas</Heading>
              <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                {form.specs.length} de {MAX_SPEC_ENTRIES} filas. Las claves se
                comparan sin distinguir mayusculas ni espacios sobrantes.
              </Text>
            </div>
            <Button
              type="button"
              size="small"
              variant="secondary"
              onClick={agregarSpec}
              disabled={form.specs.length >= MAX_SPEC_ENTRIES}
            >
              Agregar fila
            </Button>
          </div>

          {form.specs.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              {
                "No hay especificaciones registradas. Use \u201cAgregar fila\u201d para crear la primera."
              }
            </Text>
          ) : (
            <div className="flex flex-col gap-y-2">
              {form.specs.map((fila, indice) => (
                <div key={fila.id} className="flex flex-col">
                  <div className="flex items-start gap-x-2">
                    <Input
                      className="w-1/3"
                      value={fila.key}
                      placeholder="Clave (ej: Rango de medicion)"
                      aria-label={`Clave de la especificacion ${indice + 1}`}
                      onChange={(e) => editarSpec(fila.id, "key", e.target.value)}
                    />
                    <Input
                      className="flex-1"
                      value={fila.value}
                      placeholder="Valor (ej: 0 a 100 bar)"
                      aria-label={`Valor de la especificacion ${indice + 1}`}
                      onChange={(e) => editarSpec(fila.id, "value", e.target.value)}
                    />
                    <IconButton
                      type="button"
                      size="small"
                      variant="transparent"
                      aria-label="Subir especificacion"
                      disabled={indice === 0}
                      onClick={() => moverSpec(indice, -1)}
                    >
                      {"\u2191"}
                    </IconButton>
                    <IconButton
                      type="button"
                      size="small"
                      variant="transparent"
                      aria-label="Bajar especificacion"
                      disabled={indice === form.specs.length - 1}
                      onClick={() => moverSpec(indice, 1)}
                    >
                      {"\u2193"}
                    </IconButton>
                    <IconButton
                      type="button"
                      size="small"
                      variant="transparent"
                      aria-label="Eliminar especificacion"
                      onClick={() => eliminarSpec(fila.id)}
                    >
                      {"\u2715"}
                    </IconButton>
                  </div>
                  <MensajeError texto={specErrores[fila.id]} />
                </div>
              ))}
            </div>
          )}
          <MensajeError texto={errorDe("specs")} />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-x-2 px-6 py-4">
          {hayErrores ? (
            <Text size="xsmall" className="text-ui-fg-error mr-auto">
              Corrija los campos marcados antes de guardar.
            </Text>
          ) : hayCambios ? (
            <Text size="xsmall" className="text-ui-fg-subtle mr-auto">
              Hay cambios sin guardar.
            </Text>
          ) : null}
          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={descartar}
            disabled={!hayCambios || mutacion.isPending}
          >
            Descartar cambios
          </Button>
          <Button
            type="submit"
            size="small"
            variant="primary"
            isLoading={mutacion.isPending}
            disabled={
              !sincronizado || !hayCambios || hayErrores || mutacion.isPending
            }
          >
            Guardar datos PIM
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductPimWidget
