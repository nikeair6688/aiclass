import {
  Trash2,
  UtensilsCrossed,
  Car,
  Hotel,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Receipt,
} from "lucide-react"
import type { Expense, Member, ExpenseCategory, CurrencyCode } from "@/types"
import { CATEGORY_CONFIG, AVATAR_COLORS, CURRENCIES, formatMoney, convertAmount } from "@/types"

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  food: <UtensilsCrossed className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  ticket: <Ticket className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
}

interface ExpenseListProps {
  expenses: Expense[]
  members: Member[]
  displayCurrency: CurrencyCode
  onRemoveExpense: (id: string) => void
}

export function ExpenseList({
  expenses,
  members,
  displayCurrency,
  onRemoveExpense,
}: ExpenseListProps) {
  const memberMap = new Map(members.map((m, i) => [m.id, { ...m, index: i }]))

  function getMemberName(id: string): string {
    return memberMap.get(id)?.name ?? "未知"
  }

  function getMemberIndex(id: string): number {
    return memberMap.get(id)?.index ?? 0
  }

  function displayAmount(expense: Expense): string {
    const converted = convertAmount(expense.amount, expense.currency, displayCurrency)
    return formatMoney(converted, displayCurrency)
  }

  return (
    <section className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">花費明細</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {expenses.length} 筆
        </span>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          還沒有花費記錄
        </p>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const isDifferentCurrency = expense.currency !== displayCurrency
            return (
              <div
                key={expense.id}
                className="group flex items-start gap-3 p-3 rounded-xl bg-background transition-smooth hover:shadow-sm"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary shrink-0 text-primary">
                  {CATEGORY_ICONS[expense.category]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CATEGORY_CONFIG[expense.category].label} ·{" "}
                        <span
                          className="font-medium"
                          style={{
                            color:
                              AVATAR_COLORS[
                                getMemberIndex(expense.paidBy) %
                                  AVATAR_COLORS.length
                              ],
                          }}
                        >
                          {getMemberName(expense.paidBy)}
                        </span>{" "}
                        付款
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-card-foreground">
                        {displayAmount(expense)}
                      </p>
                      {isDifferentCurrency && (
                        <p className="text-[10px] text-muted-foreground">
                          {CURRENCIES[expense.currency].flag}{" "}
                          {formatMoney(expense.amount, expense.currency)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {expense.splitAmong.length}人分
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    {expense.splitAmong.map((id) => (
                      <div
                        key={id}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          backgroundColor:
                            AVATAR_COLORS[
                              getMemberIndex(id) % AVATAR_COLORS.length
                            ],
                          color: "white",
                        }}
                        title={getMemberName(id)}
                      >
                        {getMemberName(id)[0]}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveExpense(expense.id)}
                  className="mt-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
