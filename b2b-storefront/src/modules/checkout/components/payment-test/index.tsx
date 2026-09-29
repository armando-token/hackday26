import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">Note:</span> For internal testing only.
    </Badge>
  )
}

export default PaymentTest
