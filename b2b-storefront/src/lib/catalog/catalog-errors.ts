/**
 * Errores tipados del catálogo (plan maestro, sección 11).
 *
 * ContractError: la respuesta de Medusa no cumple el contrato; no se debe
 * degradar a datos emptys ni inventar valores por defecto.
 * NetworkError: fallo de red o del servidor; puede usarse caché previa si existe.
 */

export class CatalogContractError extends Error {
  readonly code = "CATALOG_CONTRACT_ERROR" as const
  readonly productId?: string
  readonly handle?: string
  readonly field?: string

  constructor(
    message: string,
    meta?: { productId?: string; handle?: string; field?: string }
  ) {
    super(message)
    this.name = "CatalogContractError"
    this.productId = meta?.productId
    this.handle = meta?.handle
    this.field = meta?.field
  }
}

export class CatalogNetworkError extends Error {
  readonly code = "CATALOG_NETWORK_ERROR" as const
  readonly status?: number
  readonly cause?: unknown

  constructor(message: string, meta?: { status?: number; cause?: unknown }) {
    super(message)
    this.name = "CatalogNetworkError"
    this.status = meta?.status
    this.cause = meta?.cause
  }
}
