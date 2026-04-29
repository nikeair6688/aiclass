import { useState } from "react"
import { Plus, X, Users, Pencil, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AVATAR_COLORS } from "@/types"
import type { Member } from "@/types"

interface MemberListProps {
  members: Member[]
  onAddMember: (name: string) => void
  onRemoveMember: (id: string) => void
  onEditMember: (id: string, newName: string) => void
}

export function MemberList({
  members,
  onAddMember,
  onRemoveMember,
  onEditMember,
}: MemberListProps) {
  const [name, setName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAddMember(trimmed)
    setName("")
    setIsAdding(false)
  }

  function startEdit(member: Member) {
    setEditingId(member.id)
    setEditName(member.name)
  }

  function confirmEdit() {
    if (editingId && editName.trim()) {
      onEditMember(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      confirmEdit()
    } else if (e.key === "Escape") {
      setEditingId(null)
      setEditName("")
    }
  }

  return (
    <section className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            旅行成員
          </h2>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            新增
          </Button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-4 animate-scale-in"
        >
          <input
            type="text"
            placeholder="輸入名字..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            加入
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAdding(false)
              setName("")
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          還沒有成員，先加入旅伴吧
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {members.map((member, index) => {
            const isEditing = editingId === member.id
            const color = AVATAR_COLORS[index % AVATAR_COLORS.length]

            return (
              <div
                key={member.id}
                className="group flex items-center gap-2 rounded-full bg-secondary pl-1 pr-2 py-1 transition-smooth hover:shadow-sm"
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: color, color: "white" }}
                >
                  {(isEditing ? editName : member.name)[0] ?? "?"}
                </div>

                {isEditing ? (
                  /* Inline edit input */
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={confirmEdit}
                    autoFocus
                    className="w-20 h-6 rounded bg-background px-1.5 text-sm text-foreground border focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                ) : (
                  /* Display name */
                  <span className="text-sm font-medium text-secondary-foreground">
                    {member.name}
                  </span>
                )}

                {/* Action buttons */}
                {isEditing ? (
                  <button
                    onClick={confirmEdit}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-primary hover:text-primary/80 transition-smooth"
                    title="確認"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(member)}
                      className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground hover:text-primary"
                      title="編輯名字"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground hover:text-destructive"
                      title="移除成員"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
