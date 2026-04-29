export interface Member {
  id: string
  name: string
  avatar: string
}

export type CurrencyCode = "JPY" | "HKD"

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  label: string
  flag: string
  decimals: number
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  JPY: { code: "JPY", symbol: "¥", label: "日元", flag: "🇯🇵", decimals: 0 },
  HKD: { code: "HKD", symbol: "HK$", label: "港元", flag: "🇭🇰", decimals: 2 },
}

// Approximate rate: 1 HKD ≈ 19.2 JPY
export const EXCHANGE_RATE_HKD_TO_JPY = 19.2

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount
  if (from === "HKD" && to === "JPY") return amount * EXCHANGE_RATE_HKD_TO_JPY
  return amount / EXCHANGE_RATE_HKD_TO_JPY
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode
): string {
  const info = CURRENCIES[currency]
  const rounded =
    info.decimals === 0
      ? Math.round(amount)
      : Math.round(amount * 100) / 100
  return `${info.symbol}${rounded.toLocaleString(undefined, {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  })}`
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: CurrencyCode
  paidBy: string
  splitAmong: string[]
  category: ExpenseCategory
  date: string
}

export type ExpenseCategory =
  | "food"
  | "transport"
  | "hotel"
  | "ticket"
  | "shopping"
  | "other"

export interface Settlement {
  from: string
  to: string
  amount: number
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string }
> = {
  food: { label: "餐飲", icon: "UtensilsCrossed" },
  transport: { label: "交通", icon: "Car" },
  hotel: { label: "住宿", icon: "Hotel" },
  ticket: { label: "門票", icon: "Ticket" },
  shopping: { label: "購物", icon: "ShoppingBag" },
  other: { label: "其他", icon: "MoreHorizontal" },
}

export const AVATAR_COLORS = [
  "hsl(8 65% 48%)",
  "hsl(340 55% 62%)",
  "hsl(145 45% 42%)",
  "hsl(38 85% 52%)",
  "hsl(270 45% 52%)",
  "hsl(200 55% 48%)",
  "hsl(20 70% 55%)",
  "hsl(170 40% 42%)",
]
