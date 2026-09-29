import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const statusMap: Record<string, string> = {
  not_fulfilled: "No despachado",
  fulfilled: "Despachado",
  partially_fulfilled: "Parcialmente despachado",
  shipped: "Enviado",
  delivered: "Entregado",
  canceled: "Cancelado",
  not_paid: "Pendiente de pago",
  awaiting: "En espera de validación",
  authorized: "Autorizado",
  captured: "Pagado",
  partially_refunded: "Reembolso parcial",
  refunded: "Reembolsado",
  requires_action: "Requiere acción",
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    if (statusMap[str]) {
      return statusMap[str]
    }
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        Hemos enviado la confirmación y los detalles del pedido a{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Fecha de la orden:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Nº de pedido: <span data-testid="order-id">#{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Estado de entrega:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Estado de pago:{" "}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
