import { Container, Heading, Text } from "@medusajs/ui"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { company } from "@lib/config/company"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const isManualPayment = !payment || payment.provider_id === "pp_system_default"

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Información de Pago
      </Heading>
      <div>
        <div className="flex items-start gap-x-1 w-full mb-6">
          <div className="flex flex-col w-1/3">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Método seleccionado
            </Text>
            <Text
              className="txt-medium text-ui-fg-subtle font-semibold"
              data-testid="payment-method"
            >
              {payment ? (paymentInfoMap[payment.provider_id]?.title || payment.provider_id) : "Transferencia / Depósito Bancario"}
            </Text>
          </div>
          <div className="flex flex-col w-2/3">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Estado de la transacción
            </Text>
            <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
              <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                {payment ? paymentInfoMap[payment.provider_id]?.icon : paymentInfoMap["pp_system_default"]?.icon}
              </Container>
              <Text data-testid="payment-amount">
                {isManualPayment ? (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ● Pendiente de Pago / Validación Bancaria
                  </span>
                ) : isStripeLike(payment?.provider_id) && payment?.data?.card_last4 ? (
                  `**** **** **** ${payment.data.card_last4}`
                ) : (
                  `${convertToLocale({
                    amount: payment?.amount || order.total,
                    currency_code: order.currency_code,
                  })} registrado el ${new Date(
                    payment?.created_at ?? order.created_at ?? ""
                  ).toLocaleDateString("es-PE")}`
                )}
              </Text>
            </div>
          </div>
        </div>

        {/* B2B Bank Transfer Instructions Box */}
        {isManualPayment && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 my-4 text-xs text-neutral-800 space-y-3">
            <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <span>🏦</span> Instrucciones para Transferencia o Depósito Bancario:
            </div>
            <p>
              Por favor realice el abono por el total de <strong>{convertToLocale({ amount: order.total, currency_code: order.currency_code })}</strong> a nombre de <strong>{company.legalName}</strong> (Tax ID: {company.taxId}) en cualquiera de nuestras accounts recaudadoras oficiales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
              <div className="bg-white p-3 rounded border border-neutral-200">
                <div className="font-bold text-blue-900">Banco de Crédito del United States (BCP)</div>
                <div><strong>Account Corriente USD:</strong> 193-9483726-0-12</div>
                <div><strong>CCI:</strong> 002-193-009483726012-14</div>
              </div>
              <div className="bg-white p-3 rounded border border-neutral-200">
                <div className="font-bold text-blue-900">BBVA United States</div>
                <div><strong>Account Corriente USD:</strong> 0011-0175-0100083921</div>
                <div><strong>CCI:</strong> 011-175-000100083921-72</div>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-900 p-3 rounded border border-blue-200">
              <strong>Importante:</strong> Una vez efectuado el abono, envíe el comprobante de transferencia al correo <a href={`mailto:${company.email}`} className="underline font-bold">{company.email}</a> o al WhatsApp <a href={`tel:${company.phoneE164}`} className="underline font-bold">{company.phoneDisplay}</a> indicando el número de pedido <strong>#{order.display_id || order.id.slice(-6)}</strong> para iniciar el fulfillment inmediato.
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
