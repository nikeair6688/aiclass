import { ArrowRight, Scale, CheckCircle2 } from "lucide-react"
import type { Settlement as SettlementType, Member, CurrencyCode } from "@/types"
import { AVATAR_COLORS, formatMoney } from "@/types"

interface SettlementProps {
  settlements: SettlementType[]
  members: Member[]
  currency: CurrencyCode
}

export function Settlement({ settlements, members, currency }: SettlementProps) {
  const memberMap = new Map(members.map((m, i) => [m.id, { ...m, index: i }]))

  function getMemberName(id: string): string {
    return memberMap.get(id)?.name ?? "未知"
  }

  function getMemberIndex(id: string): number {
    return memberMap.get(id)?.index ?? 0
  }

  return (
    <section className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">結算</h2>
      </div>

      {settlements.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mb-2" />
          <p className="text-sm font-medium text-card-foreground">帳目已結清</p>
          <p className="text-xs text-muted-foreground mt-1">
            所有人的花費平衡，無需轉帳
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {settlements.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl bg-background transition-smooth hover:shadow-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor:
                      AVATAR_COLORS[
                        getMemberIndex(s.from) % AVATAR_COLORS.length
                      ],
                    color: "white",
                  }}
                >
                  {getMemberName(s.from)[0]}
                </div>
                <span className="text-sm font-medium text-card-foreground truncate">
                  {getMemberName(s.from)}
                </span>
              </div>

              <div className="flex flex-col items-center shrink-0 px-2">
                <ArrowRight className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent mt-0.5">
                  {formatMoney(s.amount, currency)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="text-sm font-medium text-card-foreground truncate">
                  {getMemberName(s.to)}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor:
                      AVATAR_COLORS[
                        getMemberIndex(s.to) % AVATAR_COLORS.length
                      ],
                    color: "white",
                  }}
                >
                  {getMemberName(s.to)[0]}
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground text-center pt-2">
            只需 {settlements.length} 筆轉帳即可結清所有帳目
          </p>
        </div>
      )}
    </section>
  )
}
