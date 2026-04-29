import type { CurrencyCode } from "@/types"
import { CURRENCIES, EXCHANGE_RATE_HKD_TO_JPY, formatMoney } from "@/types"

interface HeaderProps {
  totalExpenses: number
  memberCount: number
  expenseCount: number
  currency: CurrencyCode
  onCurrencyChange: (currency: CurrencyCode) => void
}

export function Header({
  totalExpenses,
  memberCount,
  expenseCount,
  currency,
  onCurrencyChange,
}: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl gradient-hero">
      <div className="absolute inset-0 opacity-25">
        <img
          src="/images/japan-hero.png"
          alt="Japan travel scenery"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm text-2xl">
              &#x26E9;
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground tracking-tight">
                TravelSplit
              </h1>
              <p className="text-primary-foreground/55 text-xs font-medium mt-0.5 tracking-wide">
                日本旅遊 · 分帳記帳
              </p>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="flex rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-1">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => onCurrencyChange(code)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth ${
                  currency === code
                    ? "bg-primary-foreground text-foreground shadow-sm"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <span>{CURRENCIES[code].flag}</span>
                <span>{CURRENCIES[code].code}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/45 text-[11px] mb-3">
          参考匯率 1 HK$ ≈ ¥{EXCHANGE_RATE_HKD_TO_JPY}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="總花費"
            value={formatMoney(totalExpenses, currency)}
          />
          <StatCard label="成員" value={`${memberCount} 人`} />
          <StatCard label="筆數" value={`${expenseCount} 筆`} />
        </div>
      </div>
    </header>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary-foreground/10 backdrop-blur-sm px-4 py-3">
      <p className="text-primary-foreground/55 text-[11px] font-medium">
        {label}
      </p>
      <p className="text-primary-foreground text-lg font-bold mt-0.5">
        {value}
      </p>
    </div>
  )
}
