import { acceptTransferRequest } from "@lib/data/orders"
import { Heading, Text } from "@medusajs/ui"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  const { success, error } = await acceptTransferRequest(id, token)

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        {success && (
          <>
            <Heading level="h1" className="text-xl text-zinc-900">
              ¡Transferencia de orden aceptada!
            </Heading>
            <Text className="text-zinc-600">
              La orden #{id} ha sido transferida exitosamente al nuevo titular.
            </Text>
          </>
        )}
        {!success && (
          <>
            <Text className="text-zinc-600">
              Ocurrió un error al aceptar la transferencia. Por favor, intente nuevamente.
            </Text>
            {error && (
              <Text className="text-red-500">Mensaje de error: {error}</Text>
            )}
          </>
        )}
      </div>
    </div>
  )
}
