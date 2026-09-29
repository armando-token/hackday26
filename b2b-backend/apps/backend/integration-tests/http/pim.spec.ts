import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { createAdminUser } from "../helpers/create-admin-user"

jest.setTimeout(180000)

/**
 * Contrato HTTP del endpoint Admin de PIM (plan maestro, secciones 9.1 y 9.2).
 *
 * Cubre la semantica que la interfaz de Marketing da por supuesta: lectura de
 * un producto sin PIM, alta, actualizacion idempotente, rechazo de datos
 * invalidos y producto inexistente.
 */
medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    let headers: Record<string, string>
    let productId: string

    beforeAll(async () => {
      const admin = await createAdminUser(getContainer())
      headers = admin.headers
    })

    beforeEach(async () => {
      const productModule = getContainer().resolve(Modules.PRODUCT)
      const [producto] = await productModule.createProducts([
        {
          title: `Sensor de prueba ${Date.now()}`,
          status: "published",
        } as any,
      ])
      productId = producto.id
    })

    describe("GET /admin/products/:id/pim", () => {
      it("devuelve pim_info nulo cuando el producto aun no tiene datos", async () => {
        const res = await api.get(`/admin/products/${productId}/pim`, { headers })

        expect(res.status).toBe(200)
        expect(res.data.pim_info).toBeNull()
      })

      it("responde 404 si el producto no existe", async () => {
        const res = await api
          .get("/admin/products/prod_inexistente_xyz/pim", { headers })
          .catch((e: any) => e.response)

        expect(res.status).toBe(404)
      })

      it("responde 401 sin credenciales", async () => {
        const res = await api
          .get(`/admin/products/${productId}/pim`)
          .catch((e: any) => e.response)

        expect(res.status).toBe(401)
      })
    })

    describe("PUT /admin/products/:id/pim", () => {
      it("crea el registro y devuelve lo persistido", async () => {
        const res = await api.put(
          `/admin/products/${productId}/pim`,
          {
            item_number: "CN-TEST-1",
            oem_brand: "Novus",
            specs: { Marca: "Novus", Voltaje: "24V" },
          },
          { headers }
        )

        // 201 porque el registro no existia: la creacion se distingue de la
        // actualizacion, que responde 200.
        expect(res.status).toBe(201)
        expect(res.data.pim_info).toMatchObject({
          product_id: productId,
          item_number: "CN-TEST-1",
          oem_brand: "Novus",
        })
        expect(res.data.pim_info.specs).toEqual({ Marca: "Novus", Voltaje: "24V" })
      })

      it("es idempotente: repetir el mismo PUT no duplica el registro", async () => {
        const cuerpo = { item_number: "CN-TEST-2" }

        const primero = await api.put(
          `/admin/products/${productId}/pim`,
          cuerpo,
          { headers }
        )
        const segundo = await api.put(
          `/admin/products/${productId}/pim`,
          cuerpo,
          { headers }
        )

        // La primera llamada crea (201) y la segunda actualiza el mismo
        // registro (200), sin generar un duplicado.
        expect(primero.status).toBe(201)
        expect(segundo.status).toBe(200)
        expect(segundo.data.pim_info.id).toBe(primero.data.pim_info.id)
      })

      it("actualiza los campos enviados y persiste tras releer", async () => {
        await api.put(
          `/admin/products/${productId}/pim`,
          { item_number: "CN-TEST-3", oem_brand: "Novus" },
          { headers }
        )

        await api.put(
          `/admin/products/${productId}/pim`,
          { item_number: "CN-TEST-3-MOD" },
          { headers }
        )

        const leido = await api.get(`/admin/products/${productId}/pim`, { headers })
        expect(leido.data.pim_info.item_number).toBe("CN-TEST-3-MOD")
      })

      it("normaliza los espacios y guarda null en los campos vacios", async () => {
        const res = await api.put(
          `/admin/products/${productId}/pim`,
          { item_number: "  CN-TEST-4  ", oem_brand: "   " },
          { headers }
        )

        expect(res.data.pim_info.item_number).toBe("CN-TEST-4")
        expect(res.data.pim_info.oem_brand).toBeNull()
      })

      it("rechaza con 400 una URL que no es https ni ruta local", async () => {
        const res = await api
          .put(
            `/admin/products/${productId}/pim`,
            { technical_pdf: "http://inseguro.example.com/f.pdf" },
            { headers }
          )
          .catch((e: any) => e.response)

        expect(res.status).toBe(400)
      })

      it("rechaza con 400 un plazo en un estado que no lo admite", async () => {
        const res = await api
          .put(
            `/admin/products/${productId}/pim`,
            { availability_mode: "in_stock", lead_time_days: 10 },
            { headers }
          )
          .catch((e: any) => e.response)

        expect(res.status).toBe(400)
      })

      it("acepta lead_time sin plazo, segun la decision D5", async () => {
        const res = await api.put(
          `/admin/products/${productId}/pim`,
          { availability_mode: "lead_time" },
          { headers }
        )

        expect(res.status).toBe(201)
        expect(res.data.pim_info.availability_mode).toBe("lead_time")
        expect(res.data.pim_info.lead_time_days).toBeNull()
      })

      it("rechaza con 400 las claves desconocidas", async () => {
        const res = await api
          .put(
            `/admin/products/${productId}/pim`,
            { campo_inventado: "x" },
            { headers }
          )
          .catch((e: any) => e.response)

        expect(res.status).toBe(400)
      })

      it("responde 404 al escribir sobre un producto inexistente", async () => {
        const res = await api
          .put(
            "/admin/products/prod_inexistente_xyz/pim",
            { item_number: "CN-X" },
            { headers }
          )
          .catch((e: any) => e.response)

        expect(res.status).toBe(404)
      })
    })
  },
})
