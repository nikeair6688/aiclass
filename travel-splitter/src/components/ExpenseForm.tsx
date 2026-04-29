import { useState } from "react"
import {
  Plus,
  X,
  UtensilsCrossed,
  Car,
  Hotel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Member, ExpenseCategory, CurrencyCode } from "@/types"
import { CATEGORY_CONFIG, CURRENCIES, formatMoney } from "@/types"

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  food: <UtensilsCrossed className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  ticket: <Ticket className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
}

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

interface ExpenseFormProps {
  members: Member[]
  currency: CurrencyCode
  onAddExpense: (expense: {
    description: string
    amount: number
    currency: CurrencyCode
    paidBy: string
    splitAmong: string[]
    category: ExpenseCategory
    date: string
  }) => void
  onClose: () => void
}

export function ExpenseForm({
  members,
  currency,
  onAddExpense,
  onClose,
}: ExpenseFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState(members[0]?.id ?? "")
  const [splitAmong, setSplitAmong] = useState<string[]>(
    members.map((m) => m.id)
  )
  const [category, setCategory] = useState<ExpenseCategory>("food")
  const [expCurrency, setExpCurrency] = useState<CurrencyCode>(currency)
  const [date, setDate] = useState(todayStr())

  function toggleSplit(id: string) {
    setSplitAmong((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function selectAll() {
    setSplitAmong(members.map((m) => m.id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return
    if (!paidBy || splitAmong.length === 0) return

    onAddExpense({
      description: description.trim(),
      amount: parsedAmount,
      currency: expCurrency,
      paidBy,
      splitAmong,
      category,
    })
  }

  const isValid =
    description.trim() &&
    parseFloat(amount) > 0 &&
    paidBy &&
    splitAmong.length > 0

  const currencyInfo = CURRENCIES[expCurrency]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-elegant animate-fade-in">
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">
              新增花費
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              分類
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth ${
                      category === cat
                        ? "bg-primary text-primary-foreground shadow-elegant"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORY_CONFIG[cat].label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              描述
            </label>
            <input
              type="text"
              placeholder="例：拉麵、新幹線..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Amount + Currency */}
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              金額
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {currencyInfo.symbol}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  step={expCurrency === "JPY" ? "1" : "0.01"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full h-10 rounded-lg border bg-background pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    expCurrency === "HKD" ? "pl-11" : "pl-7"
                  }`}
                />
              </div>
              <div className="flex rounded-lg border bg-background p-0.5">
                {(["JPY", "HKD"] as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setExpCurrency(code)}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-smooth ${
                      expCurrency === code
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {CURRENCIES[code].flag} {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              誰付的
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split among */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-card-foreground">
                分攤給誰
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary font-medium hover:underline"
              >
                全選
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const selected = splitAmong.includes(m.id)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleSplit(m.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m.name}
                  </button>
                )
              })}
            </div>
            {splitAmong.length > 0 && parseFloat(amount) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                每人分攤{" "}
                {formatMoney(
                  parseFloat(amount) / splitAmong.length,
                  expCurrency
                )}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth"
            disabled={!isValid}
          >
            <Plus className="w-5 h-5 mr-2" />
            新增花費
          </Button>
        </form>
      </div>
    </div>
  )
}
