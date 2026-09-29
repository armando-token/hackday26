import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Skeleton,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"

import { describeApiError, formatApiError, sdk } from "../../lib/sdk"

/**
 * Listado de marcas (plan maestro, seccion 10.4).
 *
 * Reemplaza la version anterior, que llamaba a `window.fetch` sin JWT y
 * ocultaba los fallos en un `console.error`, dejando una tabla vacia sin
 * explicacion. Sigue siendo una vista de solo lectura.
 */

type Brand = {
  id: string
  name?: string | null
  handle?: string | null
  country_of_origin?: string | null
  is_authorized_distributor?: boolean | null
  website_url?: string | null
}

type BrandsResponse = { brands?: Brand[]; count?: number }

const BrandsPage = () => {
  const consulta = useQuery({
    queryKey: ["brands"],
    queryFn: () =>
      sdk.client.fetch<BrandsResponse>("/admin/brands", { method: "GET" }),
    retry: (intentos, error) => {
      const { status } = describeApiError(error)
      if (status === 401 || status === 403) {
        return false
      }
      return intentos < 2
    },
  })

  const brands = consulta.data?.brands ?? []

  const encabezado = (
    <div className="flex items-start justify-between px-6 py-4">
      <div>
        <Heading level="h1">Marcas y fabricantes oficiales</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Fabricantes de instrumentacion industrial de los cuales Control
          Nautas es distribuidor autorizado.
        </Text>
      </div>
      {consulta.isSuccess ? (
        <Badge size="2xsmall" color="blue">
          {consulta.data?.count ?? brands.length} marcas
        </Badge>
      ) : null}
    </div>
  )

  if (consulta.isPending) {
    return (
      <Container className="divide-y p-0">
        {encabezado}
        <div className="flex flex-col gap-y-3 px-6 py-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
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
            No se pudo cargar el listado de marcas.
          </Text>
          <Button
            size="small"
            variant="secondary"
            onClick={() => consulta.refetch()}
            isLoading={consulta.isFetching}
          >
            Reintentar
          </Button>
        </div>
      </Container>
    )
  }

  if (!brands.length) {
    return (
      <Container className="divide-y p-0">
        {encabezado}
        <div className="flex flex-col items-start gap-y-3 px-6 py-6">
          <Text size="small" className="text-ui-fg-subtle">
            Todavia no hay marcas registradas.
          </Text>
          <Button
            size="small"
            variant="secondary"
            onClick={() => consulta.refetch()}
            isLoading={consulta.isFetching}
          >
            Actualizar
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      {encabezado}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Marca / fabricante</Table.HeaderCell>
            <Table.HeaderCell>Identificador</Table.HeaderCell>
            <Table.HeaderCell>Pais de origen</Table.HeaderCell>
            <Table.HeaderCell>Distribucion</Table.HeaderCell>
            <Table.HeaderCell>Sitio web oficial</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {brands.map((b) => (
            <Table.Row key={b.id}>
              <Table.Cell>
                <Text size="small" weight="plus">
                  {b.name || "Sin nombre"}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text size="small" className="text-ui-fg-subtle">
                  {b.handle || "—"}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text size="small">{b.country_of_origin || "Global"}</Text>
              </Table.Cell>
              <Table.Cell>
                {b.is_authorized_distributor ? (
                  <Badge size="2xsmall" color="green">
                    Distribuidor autorizado
                  </Badge>
                ) : (
                  <Badge size="2xsmall" color="grey">
                    Estandar
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell>
                {b.website_url ? (
                  <a
                    href={b.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    <Text size="small" as="span">
                      {b.website_url.replace(/^https?:\/\//, "")}
                    </Text>
                  </a>
                ) : (
                  <Text size="small" className="text-ui-fg-muted">
                    —
                  </Text>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Marcas",
})

export default BrandsPage
