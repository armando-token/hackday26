import {
  maskToken,
  validateMuseToken,
  getMuseAuthConfig,
  verifyMuseToken,
  extractBearerToken,
  museConfig,
  MUSE_ALLOWED_CORS_ORIGINS,
  MUSE_FORBIDDEN_CORS_ORIGINS,
  isMuseOriginAllowed,
  isForbiddenOrigin,
} from "../muse/config"

describe("muse/config", () => {
  const originalEnv = process.env.MUSE_API_TOKEN

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.MUSE_API_TOKEN = originalEnv
    } else {
      delete process.env.MUSE_API_TOKEN
    }
  })

  describe("maskToken", () => {
    it("conserva solo los primeros 4 y últimos 4 caracteres", () => {
      const token = "mus_1234567890abcdef1234567890abcdef1234567890abcdef1234567890aba1b2"
      const masked = maskToken(token)
      expect(masked).toBe("mus_...a1b2")
      expect(masked.startsWith("mus_")).toBe(true)
      expect(masked.endsWith("a1b2")).toBe(true)
      expect(masked).not.toContain("1234567890")
    })

    it("enmascara con asteriscos si la longitud es menor o igual a 8", () => {
      expect(maskToken("mus_12")).toBe("****")
      expect(maskToken("12345678")).toBe("****")
    })

    it("maneja tokens vacíos o no válidos de forma segura", () => {
      expect(maskToken("")).toBe("****")
      expect(maskToken(null as any)).toBe("****")
      expect(maskToken(undefined as any)).toBe("****")
    })
  })

  describe("validateMuseToken", () => {
    it("permite tokens válidos sin lanzar error", () => {
      expect(() => validateMuseToken("mus_valid_token_value_1234")).not.toThrow()
    })

    it("lanza error descriptivo si el token está ausente o vacío", () => {
      expect(() => validateMuseToken(undefined)).toThrow(/MUSE_API_TOKEN is missing/)
      expect(() => validateMuseToken("")).toThrow(/MUSE_API_TOKEN is missing/)
      expect(() => validateMuseToken("   ")).toThrow(/MUSE_API_TOKEN is missing/)
    })
  })

  describe("getMuseAuthConfig & museConfig", () => {
    it("lanza error si MUSE_API_TOKEN no está definido en el entorno", () => {
      delete process.env.MUSE_API_TOKEN
      expect(() => getMuseAuthConfig()).toThrow(/MUSE_API_TOKEN is missing/)
    })

    it("retorna configuración tipada y enmascarada cuando la variable está definida", () => {
      const dummyToken = "mus_test_secret_token_value_xyz9"
      process.env.MUSE_API_TOKEN = dummyToken

      const config = getMuseAuthConfig()
      expect(config.apiToken).toBe(dummyToken)
      expect(config.maskedToken).toBe("mus_...xyz9")

      // Verifica acceso perezoso a través del objeto museConfig
      expect(museConfig.apiToken).toBe(dummyToken)
      expect(museConfig.maskedToken).toBe("mus_...xyz9")
    })
  })

  describe("verifyMuseToken", () => {
    const dummyToken = "mus_constant_time_verification_token_9999"

    beforeEach(() => {
      process.env.MUSE_API_TOKEN = dummyToken
    })

    it("retorna true para un token idéntico", () => {
      expect(verifyMuseToken(dummyToken)).toBe(true)
    })

    it("retorna false para tokens diferentes o longitudes distintas", () => {
      expect(verifyMuseToken("mus_wrong_token")).toBe(false)
      expect(verifyMuseToken("mus_constant_time_verification_token_8888")).toBe(false)
      expect(verifyMuseToken(undefined)).toBe(false)
      expect(verifyMuseToken("")).toBe(false)
    })
  })

  describe("extractBearerToken", () => {
    it("extrae el token de un encabezado Bearer", () => {
      expect(extractBearerToken("Bearer mus_secret_token")).toBe("mus_secret_token")
      expect(extractBearerToken("bearer mus_secret_token")).toBe("mus_secret_token")
    })

    it("retorna el valor limpio si no incluye prefijo Bearer", () => {
      expect(extractBearerToken("mus_secret_token")).toBe("mus_secret_token")
    })

    it("retorna null si el valor está ausente", () => {
      expect(extractBearerToken(undefined)).toBeNull()
      expect(extractBearerToken(null)).toBeNull()
      expect(extractBearerToken("")).toBeNull()
    })
  })

  describe("CORS Configuration", () => {
    it("explicitly includes all required allowed origins", () => {
      const required = [
        "https://data.controlnautas.com",
        "https://www.data.controlnautas.com",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:9000",
        "http://127.0.0.1:9000",
      ]
      for (const origin of required) {
        expect(MUSE_ALLOWED_CORS_ORIGINS).toContain(origin)
        expect(isMuseOriginAllowed(origin)).toBe(true)
      }
    })

    it("strictly prohibits apex domain and production URLs", () => {
      const forbidden = [
        "https://controlnautas.com",
        "http://controlnautas.com",
        "https://www.controlnautas.com",
        "http://www.controlnautas.com",
      ]
      for (const origin of forbidden) {
        expect(isForbiddenOrigin(origin)).toBe(true)
        expect(isMuseOriginAllowed(origin)).toBe(false)
        expect(MUSE_ALLOWED_CORS_ORIGINS).not.toContain(origin)
      }
    })

    it("museConfig exposes CORS settings", () => {
      expect(museConfig.allowedCorsOrigins).toBe(MUSE_ALLOWED_CORS_ORIGINS)
      expect(museConfig.forbiddenCorsOrigins).toBe(MUSE_FORBIDDEN_CORS_ORIGINS)
      expect(museConfig.isOriginAllowed("https://data.controlnautas.com")).toBe(true)
      expect(museConfig.isOriginAllowed("https://controlnautas.com")).toBe(false)
    })
  })
})
