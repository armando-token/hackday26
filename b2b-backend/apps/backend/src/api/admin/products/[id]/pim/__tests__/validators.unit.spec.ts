import {
  AdminUpsertPimSchema,
  MAX_SPEC_ENTRIES,
  MAX_SPEC_KEY_LENGTH,
  MAX_SPEC_VALUE_LENGTH,
  SEO_TITLE_MAX,
} from "../validators"

/**
 * Contrato del endpoint Admin de PIM (plan maestro, secciones 6.1, 8.3 y 9.1).
 *
 * Estas pruebas fijan el comportamiento del validador, que es la unica barrera
 * entre el formulario del Admin y la fuente de verdad. El incidente 01 mostro
 * el coste de no tener esta red: un fallo silencioso escribe datos vacios sobre
 * el catalogo real.
 */

/** Ejecuta el schema y devuelve los datos ya transformados. */
function parsear(entrada: unknown) {
  return AdminUpsertPimSchema.parse(entrada)
}

/** Devuelve los mensajes de error de un parseo fallido. */
function errores(entrada: unknown): string[] {
  const r = AdminUpsertPimSchema.safeParse(entrada)
  if (r.success) {
    return []
  }
  return r.error.issues.map((i) => i.message)
}

describe("AdminUpsertPimSchema — normalizacion de texto", () => {
  it("recorta los espacios sobrantes", () => {
    expect(parsear({ item_number: "  CN-10756  " }).item_number).toBe("CN-10756")
  })

  it("convierte la cadena vacia en null, para no guardar texto en blanco", () => {
    expect(parsear({ item_number: "" }).item_number).toBeNull()
  })

  it("convierte una cadena de solo espacios en null", () => {
    expect(parsear({ oem_brand: "   " }).oem_brand).toBeNull()
  })

  it("conserva el null explicito, que es como se borra un campo", () => {
    expect(parsear({ mfr_model: null }).mfr_model).toBeNull()
  })

  it("rechaza un texto que supera su limite", () => {
    expect(errores({ item_number: "x".repeat(101) })).toContain(
      "Maximo 100 caracteres"
    )
  })
})

describe("AdminUpsertPimSchema — claves desconocidas", () => {
  it("rechaza campos que no pertenecen al contrato", () => {
    const r = AdminUpsertPimSchema.safeParse({ campo_inventado: "x" })
    expect(r.success).toBe(false)
  })

  it("no permite inyectar product_id desde el cuerpo", () => {
    const r = AdminUpsertPimSchema.safeParse({ product_id: "prod_otro" })
    expect(r.success).toBe(false)
  })
})

describe("AdminUpsertPimSchema — URLs de documentos e imagenes", () => {
  it("admite una ruta local", () => {
    expect(parsear({ technical_pdf: "/docs/ficha.pdf" }).technical_pdf).toBe(
      "/docs/ficha.pdf"
    )
  })

  it("admite https", () => {
    expect(parsear({ manual_pdf: "https://cdn.example.com/m.pdf" }).manual_pdf).toBe(
      "https://cdn.example.com/m.pdf"
    )
  })

  it("rechaza http plano, que degradaria la pagina", () => {
    expect(errores({ og_image: "http://example.com/i.png" }).length).toBeGreaterThan(0)
  })

  it("rechaza esquemas peligrosos como javascript:", () => {
    expect(errores({ og_image: "javascript:alert(1)" }).length).toBeGreaterThan(0)
  })

  it("admite null para quitar el documento", () => {
    expect(parsear({ technical_pdf: null }).technical_pdf).toBeNull()
  })
})

describe("AdminUpsertPimSchema — disponibilidad y plazo (decision D5)", () => {
  it("acepta lead_time sin plazo: la tienda mostrara 'Consultar plazo'", () => {
    const r = AdminUpsertPimSchema.safeParse({
      availability_mode: "lead_time",
    })
    expect(r.success).toBe(true)
  })

  it("acepta lead_time con un plazo concreto", () => {
    expect(
      parsear({ availability_mode: "lead_time", lead_time_days: 15 }).lead_time_days
    ).toBe(15)
  })

  it("rechaza un plazo cuando la disponibilidad no lo admite", () => {
    expect(
      errores({ availability_mode: "in_stock", lead_time_days: 15 })
    ).toContain(
      "lead_time_days solo puede definirse cuando availability_mode es lead_time"
    )
  })

  it("permite null en el plazo con cualquier disponibilidad", () => {
    const r = AdminUpsertPimSchema.safeParse({
      availability_mode: "in_stock",
      lead_time_days: null,
    })
    expect(r.success).toBe(true)
  })

  it("rechaza un plazo de cero dias", () => {
    const r = AdminUpsertPimSchema.safeParse({
      availability_mode: "lead_time",
      lead_time_days: 0,
    })
    expect(r.success).toBe(false)
  })

  it("rechaza un valor de enum inexistente", () => {
    const r = AdminUpsertPimSchema.safeParse({ availability_mode: "inventado" })
    expect(r.success).toBe(false)
  })
})

describe("AdminUpsertPimSchema — especificaciones tecnicas", () => {
  it("conserva las especificaciones validas", () => {
    expect(parsear({ specs: { Marca: "Novus", Voltaje: "24V" } }).specs).toEqual({
      Marca: "Novus",
      Voltaje: "24V",
    })
  })

  it("convierte numeros y booleanos a texto", () => {
    expect(parsear({ specs: { Peso: 12.5, Activo: true } }).specs).toEqual({
      Peso: "12.5",
      Activo: "true",
    })
  })

  it("omite valores no representables en lugar de fallar", () => {
    expect(
      parsear({ specs: { a: "ok", b: null, c: [1, 2], d: { x: 1 } } }).specs
    ).toEqual({ a: "ok" })
  })

  it("omite las claves vacias", () => {
    expect(parsear({ specs: { "   ": "x", Real: "y" } }).specs).toEqual({ Real: "y" })
  })

  it("recorta claves y valores", () => {
    expect(parsear({ specs: { "  Marca  ": "  Novus  " } }).specs).toEqual({
      Marca: "Novus",
    })
  })

  it("rechaza claves duplicadas al ignorar mayusculas", () => {
    const msgs = errores({ specs: { Marca: "a", marca: "b" } })
    expect(msgs.some((m) => m.includes("Clave duplicada"))).toBe(true)
  })

  it("rechaza una clave demasiado larga", () => {
    const msgs = errores({ specs: { ["k".repeat(MAX_SPEC_KEY_LENGTH + 1)]: "v" } })
    expect(msgs.some((m) => m.includes("supera"))).toBe(true)
  })

  it("rechaza un valor demasiado largo", () => {
    const msgs = errores({ specs: { k: "v".repeat(MAX_SPEC_VALUE_LENGTH + 1) } })
    expect(msgs.some((m) => m.includes("supera"))).toBe(true)
  })

  it("admite el maximo de filas permitido", () => {
    const specs: Record<string, string> = {}
    for (let i = 0; i < MAX_SPEC_ENTRIES; i++) {
      specs[`clave_${i}`] = "v"
    }
    expect(Object.keys(parsear({ specs }).specs ?? {})).toHaveLength(
      MAX_SPEC_ENTRIES
    )
  })

  it("acepta el objeto vacio para borrar todas las especificaciones", () => {
    expect(parsear({ specs: {} }).specs).toEqual({})
  })
})

describe("AdminUpsertPimSchema — limites SEO", () => {
  it("admite titulos por encima del recomendado, como los 494 ya existentes", () => {
    const titulo = "t".repeat(101)
    expect(parsear({ seo_title: titulo }).seo_title).toBe(titulo)
  })

  it("rechaza un titulo que supera el limite duro", () => {
    const r = AdminUpsertPimSchema.safeParse({
      seo_title: "t".repeat(SEO_TITLE_MAX + 1),
    })
    expect(r.success).toBe(false)
  })
})

describe("AdminUpsertPimSchema — cuerpo completo", () => {
  it("acepta el cuerpo vacio como operacion sin cambios", () => {
    expect(AdminUpsertPimSchema.safeParse({}).success).toBe(true)
  })

  it("acepta un registro realista completo", () => {
    const r = AdminUpsertPimSchema.safeParse({
      mfr_model: "Serie SMT (Punta de Metal)",
      item_number: "CN-10756",
      purchase_mode: "buy_now",
      availability_mode: "in_stock",
      lead_time_days: null,
      oem_brand: "Novus",
      technical_pdf: "/docs/smt.pdf",
      seo_title: "Sensores de Temperatura Serie SMT Novus",
      specs: { Marca: "Novus Automation", "Rango de Temperatura": "-50°C a +400°C" },
    })
    expect(r.success).toBe(true)
  })
})
