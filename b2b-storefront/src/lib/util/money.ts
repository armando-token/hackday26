import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  const targetCurrency = (currency_code || "pen").toUpperCase()
  return new Intl.NumberFormat(locale === "en-US" ? "es-PE" : locale, {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
