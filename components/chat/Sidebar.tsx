'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from '@/lib/types'

interface SidebarProps {
  currentId?: string
  onNewChat: () => void
}

export default function Sidebar({ currentId, onNewChat }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadConversations()
  }, [pathname])

  async function loadConversations() {
    const res = await fetch('/api/conversations')
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations || [])
    }
    setLoading(false)
  }

  async function deleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Excluir esta tese?')) return

    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    setConversations(prev => prev.filter(c => c.id !== id))

    if (currentId === id) router.push('/chat')
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-bg2 border-r border-border h-full">

      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="font-serif text-xl text-red mb-1">DWV</div>
        <div className="text-muted text-[10px] tracking-widest uppercase">Teses de Investimento</div>
      </div>

      {/* Novo chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-muted text-sm hover:text-off hover:border-[#333] transition-all"
        >
          <span className="text-base leading-none">+</span>
          Nova tese
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="text-muted text-xs text-center py-8">Carregando...</div>
        ) : conversations.length === 0 ? (
          <div className="text-muted text-xs text-center py-8 leading-relaxed px-4">
            Nenhuma tese ainda.<br />Clique em "Nova tese" para começar.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className={`group w-full text-left px-3 py-2.5 rounded-lg transition-all relative ${
                  currentId === conv.id
                    ? 'bg-bg3 text-off'
                    : 'text-muted hover:bg-bg3 hover:text-off'
                }`}
              >
                <div className="text-xs font-medium truncate pr-6">
                  {conv.title}
                </div>
                <div className="text-[10px] text-muted/60 mt-0.5">
                  {formatDate(conv.updated_at)}
                </div>

                {/* Delete btn */}
                <button
                  onClick={e => deleteConversation(e, conv.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted hover:text-red transition-all text-xs px-1"
                >
                  ✕
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-muted hover:text-off transition-colors px-3 py-2"
        >
          ← Sair
        </button>
      </div>
    </aside>
  )
}
