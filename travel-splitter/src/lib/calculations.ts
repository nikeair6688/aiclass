import type { Expense, Settlement, CurrencyCode } from "@/types"
import { convertAmount } from "@/types"

export function calculateSettlements(
  expenses: Expense[],
  memberIds: string[],
  displayCurrency: CurrencyCode
): Settlement[] {
  const balances = new Map<string, number>()

  for (const id of memberIds) {
    balances.set(id, 0)
  }

  for (const expense of expenses) {
    const amountInDisplay = convertAmount(
      expense.amount,
      expense.currency,
      displayCurrency
    )
    const sharePerPerson = amountInDisplay / expense.splitAmong.length

    const currentPaid = balances.get(expense.paidBy) ?? 0
    balances.set(expense.paidBy, currentPaid + amountInDisplay)

    for (const personId of expense.splitAmong) {
      const currentOwed = balances.get(personId) ?? 0
      balances.set(personId, currentOwed - sharePerPerson)
    }
  }

  const debtors: { id: string; amount: number }[] = []
  const creditors: { id: string; amount: number }[] = []

  for (const [id, balance] of balances) {
    if (balance < -0.01) {
      debtors.push({ id, amount: -balance })
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance })
    }
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount)

    if (amount > 0.01) {
      settlements.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(amount * 100) / 100,
      })
    }

    debtors[i].amount -= amount
    creditors[j].amount -= amount

    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }

  return settlements
}

export function getTotalExpenses(
  expenses: Expense[],
  displayCurrency: CurrencyCode
): number {
  return expenses.reduce(
    (sum, e) => sum + convertAmount(e.amount, e.currency, displayCurrency),
    0
  )
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}
