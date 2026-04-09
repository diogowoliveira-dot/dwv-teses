import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ChatMessage } from '@/lib/types'

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

    // Chamar Claude API via fetch direto
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text()
      console.error('Anthropic API error:', anthropicRes.status, errBody)
      return NextResponse.json({ error: 'Erro na API de IA' }, { status: 502 })
    }

    const response = await anthropicRes.json()
    const assistantContent = response.content?.[0]?.type === 'text'
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
  } catch (error: any) {
    console.error('Chat error:', error?.message || error)
    console.error('Chat error details:', JSON.stringify({
      name: error?.name,
      status: error?.status,
      message: error?.message,
      type: error?.type,
    }))

    const message = error?.status === 401
      ? 'API key inválida'
      : error?.status === 429
      ? 'Limite de requisições atingido'
      : error?.message || 'Erro interno'

    return NextResponse.json({ error: message }, { status: error?.status || 500 })
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
