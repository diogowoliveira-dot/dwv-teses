import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatLayout from '@/components/chat/ChatLayout'
import { ChatMessage } from '@/lib/types'

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar conversa e mensagens
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, title')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!conv) redirect('/chat')

  const { data: msgs } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const messages: ChatMessage[] = (msgs || []).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return (
    <ChatLayout
      conversationId={params.id}
      messages={messages}
      currentConvId={params.id}
    />
  )
}
