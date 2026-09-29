import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { AdminUpsertPimSchema, type AdminUpsertPimInput } from "./validators"

/**
 * API Admin de PIM.
 *
 * Plan maestro, seccion 9.2. Reemplaza la version anterior, que carecia de
 * validacion, no comprobaba la existencia del producto, extraia el id
 * parseando req.url y devolvia el body en lugar del registro persistido.
 */

const PIM_MODULE = "b2bPim"

type PimService = {
  listPimInfos?: (...a: any[]) => Promise<any[]>
  listPimInfoes?: (...a: any[]) => Promise<any[]>
  createPimInfos?: (...a: any[]) => Promise<any>
  createPimInfoes?: (...a: any[]) => Promise<any>
  updatePimInfos?: (...a: any[]) => Promise<any>
  updatePimInfoes?: (...a: any[]) => Promise<any>
}

/**
 * El servicio autogenerado pluraliza distinto segun la version instalada
 * (listPimInfos vs listPimInfoes). Se resuelve una sola vez y de forma
 * explicita, en lugar de asumir una de las dos.
 */
function resolverMetodos(svc: PimService) {
  // Los metodos se vinculan al servicio: extraerlos sueltos pierde el `this` y
  // MedusaService falla al acceder a su baseRepository_.
  const pick = (
    a: ((...x: any[]) => Promise<any>) | undefined,
    b: ((...x: any[]) => Promise<any>) | undefined,
    nombre: string
  ) => {
    const fn = a ?? b
    if (!fn) {
      throw new Error(`El servicio de PIM no expone ${nombre}`)
    }
    return fn.bind(svc)
  }
  return {
    list: pick(svc.listPimInfos, svc.listPimInfoes, "list"),
    create: pick(svc.createPimInfos, svc.createPimInfoes, "create"),
    update: pick(svc.updatePimInfos, svc.updatePimInfoes, "update"),
  }
}

function requestId(req: MedusaRequest): string {
  return (
    (req.headers["x-request-id"] as string) ||
    `pim_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  )
}

async function productoExiste(req: MedusaRequest, id: string): Promise<boolean> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id },
  })
  return data.length > 0
}

// ---------------------------------------------------------------------- GET

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rid = requestId(req)
  const id = req.params.id

  try {
    if (!(await productoExiste(req, id))) {
      return res.status(404).json({
        code: "PRODUCT_NOT_FOUND",
        message: `No existe el producto ${id}`,
        request_id: rid,
      })
    }

    const svc = req.scope.resolve(PIM_MODULE) as PimService
    const { list } = resolverMetodos(svc)
    const filas = await list({ product_id: id })

    if (filas.length > 1) {
      // El indice unico parcial deberia impedirlo; si ocurre, es corrupcion.
      return res.status(409).json({
        code: "PIM_INTEGRITY_CONFLICT",
        message: `El producto ${id} tiene ${filas.length} registros PIM activos`,
        request_id: rid,
      })
    }

    return res.status(200).json({ pim_info: filas[0] || null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    req.scope.resolve(ContainerRegistrationKeys.LOGGER).error(
      `[${rid}] GET pim ${id}: ${msg}`
    )
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Error recuperando la informacion PIM",
      request_id: rid,
    })
  }
}

// ------------------------------------------------------------------ upsert

async function upsert(req: MedusaRequest, res: MedusaResponse) {
  const rid = requestId(req)
  const id = req.params.id

  // validateAndTransformBody deja el resultado en validatedBody; si el
  // middleware no estuviera registrado, se valida aqui para no confiar en el body crudo.
  const parsed =
    (req as any).validatedBody ??
    (() => {
      const r = AdminUpsertPimSchema.safeParse(req.body)
      if (!r.success) return { __error: r.error }
      return r.data
    })()

  if (parsed && (parsed as any).__error) {
    const zerr = (parsed as any).__error
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "El cuerpo de la peticion no es valido",
      fieldErrors: zerr.flatten?.().fieldErrors ?? {},
      request_id: rid,
    })
  }

  const body = parsed as AdminUpsertPimInput

  try {
    if (!(await productoExiste(req, id))) {
      return res.status(404).json({
        code: "PRODUCT_NOT_FOUND",
        message: `No existe el producto ${id}`,
        request_id: rid,
      })
    }

    const svc = req.scope.resolve(PIM_MODULE) as PimService
    const { list, create, update } = resolverMetodos(svc)

    const existentes = await list({ product_id: id })

    if (existentes.length > 1) {
      return res.status(409).json({
        code: "PIM_INTEGRITY_CONFLICT",
        message: `El producto ${id} tiene ${existentes.length} registros PIM activos`,
        request_id: rid,
      })
    }

    let persistido: any
    let creado = false

    if (existentes.length === 1) {
      persistido = await update({ id: existentes[0].id, ...body })
    } else {
      try {
        persistido = await create({ product_id: id, ...body })
        creado = true
      } catch (e) {
        /**
         * Concurrencia (seccion 9.3): si otra peticion creo la fila entre el
         * list y el create, el indice unico la rechaza. Se relee y se actualiza
         * una sola vez, de forma idempotente, en lugar de propagar el error.
         */
        const msg = e instanceof Error ? e.message : String(e)
        const esUnicidad =
          msg.includes("IDX_pim_info_product_id_unique") ||
          msg.includes("duplicate key") ||
          msg.includes("unique constraint")
        if (!esUnicidad) throw e

        const relectura = await list({ product_id: id })
        if (!relectura.length) throw e
        persistido = await update({ id: relectura[0].id, ...body })
      }
    }

    // El servicio puede devolver el objeto o un array de un elemento.
    const registro = Array.isArray(persistido) ? persistido[0] : persistido

    // Evento para invalidacion de cache (seccion 16). Su ausencia no debe
    // impedir el guardado, pero si registrarse.
    try {
      const eventBus = req.scope.resolve(Modules.EVENT_BUS) as any
      await eventBus.emit({
        name: "b2b-pim.updated",
        data: {
          product_id: id,
          pim_info_id: registro?.id,
          updated_at: registro?.updated_at,
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      req.scope.resolve(ContainerRegistrationKeys.LOGGER).error(
        `[${rid}] no se pudo emitir b2b-pim.updated para ${id}: ${msg}`
      )
    }

    // Se devuelve el registro persistido, no el body recibido.
    return res.status(creado ? 201 : 200).json({ pim_info: registro })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    req.scope.resolve(ContainerRegistrationKeys.LOGGER).error(
      `[${rid}] upsert pim ${id}: ${msg}`
    )
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Error guardando la informacion PIM",
      request_id: rid,
    })
  }
}

/** PUT es la forma preferida por ser un upsert idempotente (seccion 9.2). */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  return upsert(req, res)
}

/** POST se conserva por compatibilidad con el widget anterior. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return upsert(req, res)
}
