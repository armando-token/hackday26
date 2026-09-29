"use client"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { Button, Text } from "@medusajs/ui"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <Text className="text-emerald-500">
          ¡Orden transferida exitosamente!
        </Text>
      )}
      {status?.decline === "success" && (
        <Text className="text-emerald-500">
          ¡Transferencia de orden rechazada exitosamente!
        </Text>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="large"
            onClick={acceptTransfer}
            isLoading={status?.accept === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Aceptar transferencia
          </Button>
          <Button
            size="large"
            variant="secondary"
            onClick={declineTransfer}
            isLoading={status?.decline === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Rechazar transferencia
          </Button>
        </div>
      )}
      {errorMessage && <Text className="text-red-500">{errorMessage}</Text>}
    </div>
  )
}

export default TransferActions
