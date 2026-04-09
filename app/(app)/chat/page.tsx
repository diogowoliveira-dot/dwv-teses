import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatLayout from '@/components/chat/ChatLayout'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Criar nova conversa automaticamente
  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({ user_id: user.id, title: 'Nova tese' })
    .select()
    .single()

  if (error || !conv) {
    return <ChatLayout conversationId="" messages={[]} />
  }

  redirect(`/chat/${conv.id}`)
}
