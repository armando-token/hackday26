import { NextRequest, NextResponse } from "next/server"
import { getLegacyRedirect } from "@lib/seo/redirects"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pe"

// Mercado exclusivo Perú (Bloque B & C)
const KNOWN_COUNTRY_CODES = new Set(["pe"])

const KNOWN_ROOT_ROUTES = new Set([
  "",
  "products",
  "store",
  "categories",
  "collections",
  "cart",
  "checkout",
  "account",
  "order",
  "nosotros",
  "contact",
  "contacto",
  "casos-de-exito",
  "entregas-y-devoluciones",
  "terminos-y-condiciones",
  "politica-de-privacidad",
  "customer-service",
  "search",
  "quick-order",
  "content",
])

function checkBasicAuth(request: NextRequest): NextResponse | null {
  const isEnabled = process.env.BASIC_AUTH_ENABLED === "true"
  if (!isEnabled) return null

  // Allow robots.txt and sitemap.xml without basic auth for crawler verification
  if (
    request.nextUrl.pathname === "/robots.txt" ||
    request.nextUrl.pathname === "/sitemap.xml" ||
    request.nextUrl.pathname.startsWith("/api/feed/")
  ) {
    return null
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    const [scheme, credentials] = authHeader.split(" ")
    if (scheme === "Basic" && credentials) {
      try {
        const decoded = atob(credentials)
        const [user, pass] = decoded.split(":")
        const expectedUser = process.env.BASIC_AUTH_USER
        const expectedPass = process.env.BASIC_AUTH_PASS
        if (expectedUser && expectedPass && user === expectedUser && pass === expectedPass) {
          return null
        }
      } catch (e) {}
    }
  }

  return new NextResponse(
    "Acceso restringido: Ingrese credenciales de desarrollo para Control Nautas.",
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Control Nautas B2B - En Desarrollo"',
      },
    }
  )
}

/**
 * Middleware principal de enrutamiento, SEO, Basic Auth y regiones.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Omitir recursos estáticos verificados y APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/cn-media") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next()
  }

  // 2. Verificación de Redirecciones SEO Legadas (301 Permanente Prioritario)
  const legacyRedirect = getLegacyRedirect(pathname)
  if (legacyRedirect) {
    const targetPath = legacyRedirect.startsWith("/pe/")
      ? legacyRedirect
      : `/pe${legacyRedirect.startsWith("/") ? "" : "/"}${legacyRedirect}`
    
    return NextResponse.redirect(new URL(targetPath, request.url), 301)
  }

  // 3. Verificación de Basic Auth para entornos de desarrollo/staging
  const authResponse = checkBasicAuth(request)
  if (authResponse) {
    return authResponse
  }

  // 4. Extracción determinista de país
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase() || ""

  // Si el primer segmento es un código de país válido exacto (/pe/...)
  if (firstSegment && KNOWN_COUNTRY_CODES.has(firstSegment)) {
    let cacheIdCookie = request.cookies.get("_medusa_cache_id")
    if (!cacheIdCookie) {
      const response = NextResponse.next()
      response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
        maxAge: 60 * 60 * 24,
      })
      return response
    }
    return NextResponse.next()
  }

  // 5. Si la ruta raíz es válida (ej. /, /store, /nosotros), redirigir a /pe/...
  if (KNOWN_ROOT_ROUTES.has(firstSegment)) {
    const targetCountry = DEFAULT_REGION || "pe"
    const queryString = request.nextUrl.search || ""
    const cleanPath = pathname === "/" ? "" : pathname
    const redirectTarget = `${request.nextUrl.origin}/${targetCountry}${cleanPath}${queryString}`

    return NextResponse.redirect(redirectTarget, 307)
  }

  // 6. Si es cualquier otra ruta desconocida (/cl, /dk, /invalido, /missing.pdf), retornar 404 limpio
  return new NextResponse("Página no encontrada en Control Nautas", { status: 404 })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|cn-media).*)",
  ],
}
