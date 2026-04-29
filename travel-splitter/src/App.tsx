import { useState, useCallback, useMemo, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { MemberList } from "@/components/MemberList"
import { ExpenseForm } from "@/components/ExpenseForm"
import { ExpenseList } from "@/components/ExpenseList"
import { Settlement } from "@/components/Settlement"
import { Toast } from "@/components/Toast"
import {
  calculateSettlements,
  getTotalExpenses,
  generateId,
} from "@/lib/calculations"
import type { Member, Expense, ExpenseCategory, CurrencyCode } from "@/types"
import { AVATAR_COLORS } from "@/types"

const STORAGE_KEY = "travel-splitter-data"

interface AppData {
  members: Member[]
  expenses: Expense[]
  currency: CurrencyCode
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        const expenses = parsed.expenses.map((e: Expense & { currency?: CurrencyCode }) => ({
          ...e,
          currency: e.currency ?? "JPY",
        }))
        return {
          members: parsed.members,
          expenses,
          currency: parsed.currency ?? "JPY",
        }
      }
    }
  } catch {
    // ignore
  }
  return { members: [], expenses: [], currency: "JPY" }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

interface ToastState {
  message: string
  type: "success" | "error"
}

function App() {
  const [members, setMembers] = useState<Member[]>(() => loadData().members)
  const [expenses, setExpenses] = useState<Expense[]>(() => loadData().expenses)
  const [currency, setCurrency] = useState<CurrencyCode>(
    () => loadData().currency
  )
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    saveData({ members, expenses, currency })
  }, [members, expenses, currency])

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type })
    },
    []
  )

  const handleAddMember = useCallback(
    (name: string) => {
      const newMember: Member = {
        id: generateId(),
        name,
        avatar: AVATAR_COLORS[members.length % AVATAR_COLORS.length],
      }
      setMembers((prev) => [...prev, newMember])
      showToast(`${name} 已加入旅行`, "success")
    },
    [members.length, showToast]
  )

  const handleRemoveMember = useCallback(
    (id: string) => {
      const member = members.find((m) => m.id === id)
      const hasExpenses = expenses.some(
        (e) => e.paidBy === id || e.splitAmong.includes(id)
      )
      if (hasExpenses) {
        showToast("此成員有相關花費，請先刪除花費記錄", "error")
        return
      }
      setMembers((prev) => prev.filter((m) => m.id !== id))
      if (member) {
        showToast(`${member.name} 已移除`, "success")
      }
    },
    [members, expenses, showToast]
  )

  const handleEditMember = useCallback(
    (id: string, newName: string) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
      )
      showToast(`名字已更新為「${newName}」`, "success")
    },
    [showToast]
  )

  const handleAddExpense = useCallback(
    (data: {
      description: string
      amount: number
      currency: CurrencyCode
      paidBy: string
      splitAmong: string[]
      category: ExpenseCategory
    }) => {
      const newExpense: Expense = {
        id: generateId(),
        ...data,
        date: new Date().toISOString(),
      }
      setExpenses((prev) => [newExpense, ...prev])
      setShowForm(false)
      showToast(`已新增「${data.description}」`, "success")
    },
    [showToast]
  )

  const handleRemoveExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      showToast("花費已刪除", "success")
    },
    [showToast]
  )

  const totalExpenses = useMemo(
    () => getTotalExpenses(expenses, currency),
    [expenses, currency]
  )

  const settlements = useMemo(
    () =>
      calculateSettlements(
        expenses,
        members.map((m) => m.id),
        currency
      ),
    [expenses, members, currency]
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        <Header
          totalExpenses={totalExpenses}
          memberCount={members.length}
          expenseCount={expenses.length}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <MemberList
          members={members}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onEditMember={handleEditMember}
        />

        {members.length >= 2 && expenses.length > 0 && (
          <Settlement
            settlements={settlements}
            members={members}
            currency={currency}
          />
        )}

        <ExpenseList
          expenses={expenses}
          members={members}
          displayCurrency={currency}
          onRemoveExpense={handleRemoveExpense}
        />
      </main>

      {/* Floating add button */}
      {members.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button
            onClick={() => setShowForm(true)}
            className="h-14 px-8 rounded-2xl gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth text-base font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增花費
          </Button>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          members={members}
          currency={currency}
          onAddExpense={handleAddExpense}
          onClose={() => setShowForm(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
