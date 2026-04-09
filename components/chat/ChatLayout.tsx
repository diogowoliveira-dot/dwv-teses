'use client'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import { ChatMessage } from '@/lib/types'

interface ChatLayoutProps {
  conversationId: string
  messages: ChatMessage[]
  currentConvId?: string
}

export default function ChatLayout({ conversationId, messages, currentConvId }: ChatLayoutProps) {
  const router = useRouter()

  async function handleNewChat() {
    const res = await fetch('/api/conversations', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      router.push(`/chat/${data.conversation.id}`)
    }
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar currentId={currentConvId} onNewChat={handleNewChat} />
      <main className="flex-1 flex flex-col min-w-0">
        {conversationId ? (
          <ChatWindow conversationId={conversationId} initialMessages={messages} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            Selecione uma tese ou crie uma nova.
          </div>
        )}
      </main>
    </div>
  )
}
