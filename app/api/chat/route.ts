import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ChatMessage } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { conversationId, messages }: { conversationId: string; messages: ChatMessage[] } = body

    if (!conversationId || !messages?.length) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verificar que a conversa pertence ao usuário
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Salvar mensagem do usuário
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg.role === 'user') {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastUserMsg.content,
      })
    }

    // Chamar Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    const assistantContent = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Salvar resposta do assistente
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantContent,
    })

    // Atualizar título da conversa na primeira mensagem
    const { data: msgCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)

    if ((msgCount?.length ?? 0) <= 2) {
      // Gerar título automático baseado na primeira mensagem do usuário
      const title = generateTitle(lastUserMsg.content)
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId)
    }

    return NextResponse.json({ content: assistantContent })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

function generateTitle(content: string): string {
  // Tentar extrair nome do empreendimento
  const patterns = [
    /(?:empreendimento|projeto|produto|lançamento)[:\s]+([A-Z][^,\n.]+)/i,
    /^([A-Z][A-Za-z\s]+)(?:,|\.|$)/m,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match?.[1]) {
      return match[1].trim().slice(0, 50)
    }
  }

  return content.slice(0, 50).trim() + (content.length > 50 ? '...' : '')
}
