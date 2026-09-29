import fs from "fs"
import path from "path"

describe("CORS & Network Security Specifications", () => {
  const backendRoot = path.resolve(__dirname, "../../../")
  const envPath = path.join(backendRoot, ".env")
  const envTemplatePath = path.join(backendRoot, ".env.template")
  const configTsPath = path.join(backendRoot, "medusa-config.ts")
  const configJsPath = path.join(backendRoot, "medusa-config.js")

  const requiredOrigins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://52.20.66.203:8000",
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    "http://52.20.66.203:9000",
    "https://data.controlnautas.com",
    "https://www.data.controlnautas.com",
  ]

  const forbiddenOrigins = [
    "https://controlnautas.com",
    "http://controlnautas.com",
    "https://www.controlnautas.com",
    "http://www.controlnautas.com",
  ]

  describe("1. Environment Files (.env and .env.template)", () => {
    it(".env must exist and configure STORE_CORS, ADMIN_CORS, AUTH_CORS without controlnautas.com", () => {
      expect(fs.existsSync(envPath)).toBe(true)
      const content = fs.readFileSync(envPath, "utf8")
      const lines = content.split("\n")

      const storeCors = lines.find((l) => l.startsWith("STORE_CORS="))?.split("=")[1] || ""
      const adminCors = lines.find((l) => l.startsWith("ADMIN_CORS="))?.split("=")[1] || ""
      const authCors = lines.find((l) => l.startsWith("AUTH_CORS="))?.split("=")[1] || ""

      expect(storeCors).toBeTruthy()
      expect(adminCors).toBeTruthy()
      expect(authCors).toBeTruthy()

      for (const origin of requiredOrigins) {
        expect(storeCors).toContain(origin)
        expect(adminCors).toContain(origin)
        expect(authCors).toContain(origin)
      }

      for (const forbidden of forbiddenOrigins) {
        expect(storeCors).not.toContain(forbidden)
        expect(adminCors).not.toContain(forbidden)
        expect(authCors).not.toContain(forbidden)
      }
    })

    it(".env.template must not have controlnautas.com in CORS or FILE_BACKEND_URL", () => {
      expect(fs.existsSync(envTemplatePath)).toBe(true)
      const content = fs.readFileSync(envTemplatePath, "utf8")
      for (const forbidden of forbiddenOrigins) {
        expect(content).not.toContain(forbidden)
      }
    })
  })

  describe("2. Medusa Config (medusa-config.js and medusa-config.ts)", () => {
    it("both medusa-config.ts and medusa-config.js must exist", () => {
      expect(fs.existsSync(configTsPath)).toBe(true)
      expect(fs.existsSync(configJsPath)).toBe(true)
    })

    it("medusa-config.js must export valid http CORS settings containing all required origins", () => {
      // Clear require cache to test fresh load
      delete require.cache[require.resolve("../../../medusa-config.js")]
      const config = require("../../../medusa-config.js")

      expect(config.projectConfig).toBeDefined()
      expect(config.projectConfig.http).toBeDefined()

      const { storeCors, adminCors, authCors } = config.projectConfig.http

      for (const origin of requiredOrigins) {
        expect(storeCors).toContain(origin)
        expect(adminCors).toContain(origin)
        expect(authCors).toContain(origin)
      }

      for (const forbidden of forbiddenOrigins) {
        expect(storeCors).not.toContain(forbidden)
        expect(adminCors).not.toContain(forbidden)
        expect(authCors).not.toContain(forbidden)
      }
    })

    it("medusa-config.js must use local backend URL instead of controlnautas.com", () => {
      const config = require("../../../medusa-config.js")
      expect(config.admin.backendUrl).not.toContain("controlnautas.com")
      expect(config.admin.backendUrl).toMatch(/http:\/\/(localhost|127\.0\.0\.1|52\.20\.66\.203):9000/)
    })
  })

  describe("3. CORS Middleware & Required Headers", () => {
    it("middlewares.ts file exists and includes CORS handling for Authorization, Content-Type, and X-Request-Id", () => {
      const middlewaresPath = path.join(backendRoot, "src/api/middlewares.ts")
      expect(fs.existsSync(middlewaresPath)).toBe(true)
      const content = fs.readFileSync(middlewaresPath, "utf8")

      expect(content).toContain("Authorization")
      expect(content).toContain("Content-Type")
      expect(content).toContain("X-Request-Id")
      expect(content).toContain("Access-Control-Allow-Headers")
      expect(content).toContain("Access-Control-Expose-Headers")
      expect(content).not.toContain("controlnautas.com in allowed")
    })

    it("corsSecurityMiddleware allows all required origins with correct headers", () => {
      const middlewaresModule = require("../../api/middlewares")
      // find corsSecurityMiddleware in routes[0].middlewares
      const routeConfig = middlewaresModule.default?.routes?.find((r: any) => r.matcher === "/*")
      expect(routeConfig).toBeDefined()
      const corsMiddleware = routeConfig.middlewares[0]

      for (const origin of requiredOrigins) {
        const headers: Record<string, string> = {}
        const req: any = {
          headers: { origin, "x-request-id": "req-12345" },
          method: "GET",
          url: "/api/muse/v1/test",
        }
        let statusCode = 200
        const res: any = {
          setHeader: jest.fn((k, v) => {
            headers[k.toLowerCase()] = v
          }),
          status: jest.fn((code) => {
            statusCode = code
            return {
              end: jest.fn(),
            }
          }),
        }
        const next = jest.fn()

        corsMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(headers["access-control-allow-origin"]).toBe(origin)
        expect(headers["access-control-allow-credentials"]).toBe("true")
        expect(headers["access-control-allow-headers"]).toContain("Authorization")
        expect(headers["access-control-allow-headers"]).toContain("Content-Type")
        expect(headers["access-control-allow-headers"]).toContain("X-Request-Id")
        expect(headers["access-control-expose-headers"]).toContain("X-Request-Id")
        expect(headers["x-request-id"]).toBe("req-12345")
      }
    })

    it("corsSecurityMiddleware rejects controlnautas.com and does not grant CORS headers", () => {
      const middlewaresModule = require("../../api/middlewares")
      const routeConfig = middlewaresModule.default?.routes?.find((r: any) => r.matcher === "/*")
      const corsMiddleware = routeConfig.middlewares[0]

      for (const forbidden of forbiddenOrigins) {
        const headers: Record<string, string> = {}
        const req: any = {
          headers: { origin: forbidden },
          method: "OPTIONS",
          url: "/api/muse/v1/test",
        }
        let statusCode = 0
        const res: any = {
          setHeader: jest.fn((k, v) => {
            headers[k.toLowerCase()] = v
          }),
          status: jest.fn((code) => {
            statusCode = code
            return {
              end: jest.fn(),
            }
          }),
        }
        const next = jest.fn()

        corsMiddleware(req, res, next)

        expect(statusCode).toBe(403)
        expect(headers["access-control-allow-origin"]).toBeUndefined()
      }
    })

    it("corsSecurityMiddleware handles preflight OPTIONS with 204 for allowed origins", () => {
      const middlewaresModule = require("../../api/middlewares")
      const routeConfig = middlewaresModule.default?.routes?.find((r: any) => r.matcher === "/*")
      const corsMiddleware = routeConfig.middlewares[0]

      const headers: Record<string, string> = {}
      const req: any = {
        headers: {
          origin: "http://52.20.66.203:8000",
          "access-control-request-method": "GET",
          "access-control-request-headers": "authorization,content-type,x-request-id",
        },
        method: "OPTIONS",
        url: "/api/muse/v1/products/search",
      }
      let statusCode = 0
      const endMock = jest.fn()
      const res: any = {
        setHeader: jest.fn((k, v) => {
          headers[k.toLowerCase()] = v
        }),
        status: jest.fn((code) => {
          statusCode = code
          return {
            end: endMock,
          }
        }),
      }
      const next = jest.fn()

      corsMiddleware(req, res, next)

      expect(statusCode).toBe(204)
      expect(endMock).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(headers["access-control-allow-origin"]).toBe("http://52.20.66.203:8000")
      expect(headers["access-control-allow-headers"]).toContain("Authorization")
      expect(headers["access-control-allow-headers"]).toContain("Content-Type")
      expect(headers["access-control-allow-headers"]).toContain("X-Request-Id")
    })

    it("corsSecurityMiddleware handles preflight OPTIONS with 204 for https://data.controlnautas.com", () => {
      const middlewaresModule = require("../../api/middlewares")
      const routeConfig = middlewaresModule.default?.routes?.find((r: any) => r.matcher === "/*")
      const corsMiddleware = routeConfig.middlewares[0]

      const headers: Record<string, string> = {}
      const req: any = {
        headers: {
          origin: "https://data.controlnautas.com",
          "access-control-request-method": "GET",
          "access-control-request-headers": "authorization,content-type,x-request-id",
        },
        method: "OPTIONS",
        url: "/api/muse/v1/products/search",
      }
      let statusCode = 0
      const endMock = jest.fn()
      const res: any = {
        setHeader: jest.fn((k, v) => {
          headers[k.toLowerCase()] = v
        }),
        status: jest.fn((code) => {
          statusCode = code
          return {
            end: endMock,
          }
        }),
      }
      const next = jest.fn()

      corsMiddleware(req, res, next)

      expect(statusCode).toBe(204)
      expect(endMock).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(headers["access-control-allow-origin"]).toBe("https://data.controlnautas.com")
      expect(headers["access-control-allow-headers"]).toContain("Authorization")
      expect(headers["access-control-allow-headers"]).toContain("Content-Type")
      expect(headers["access-control-allow-headers"]).toContain("X-Request-Id")
    })
  })
})
