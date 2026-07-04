import { format, parseISO } from 'date-fns'

export const fmtCurrency = (amount: number, symbol = '₹') =>
  `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const fmtDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export const fmtDateTime = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a')
  } catch {
    return dateStr
  }
}

export const fmtNumber = (n: number) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => format(new Date(), 'yyyy-MM-dd')

export const monthStart = () => {
  const d = new Date()
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd')
}
