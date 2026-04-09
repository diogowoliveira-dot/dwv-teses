'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from '@/lib/types'
import { exportToPDF } from '@/lib/export-pdf'

interface ChatWindowProps {
  conversationId: string
  initialMessages?: ChatMessage[]
}

const EXAMPLES = [
  'Lumina Residence, Incorporadora Horizonte, Batel, Curitiba/PR. Entrega Mar/2028. 120 unidades, 45 vendidas. Tipologia: 3 suítes, 2 vagas, 89m², R$ 1.290.000. Bairro Batel (12 meses): 410 disp / 132 vend. m² disp R$16.200 / vend R$15.800. Ticket disp R$1.512.195 / vend R$1.500.000.',
  'Bakers Bay, Alumbra, Porto Belo SC, entrega 2030. Unidade 801: 4 suítes 2 vagas 172m² R$2.451.000. Porto Belo 4 suítes 160-180m² (últ. 30 dias): m² disp R$17.132 / vend R$19.343. Ticket disp R$2.890.719 / vend R$3.134.200. Mediana disp R$2.458.372 / vend R$2.769.800.',
]

export default function ChatWindow({ conversationId, initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages: newMessages,
        }),
      })

      const data = await res.json()

      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        // Atualizar sidebar
        router.refresh()
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao conectar. Tente novamente.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Welcome screen */
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="max-w-lg w-full text-center">
              <div className="font-serif text-5xl text-red mb-3">DWV</div>
              <p className="text-muted text-sm leading-relaxed mb-10">
                Cole os dados do produto e do mercado em qualquer ordem.<br />
                Os quadros comparativos aparecem aqui, tabela a tabela.
              </p>

              <div className="text-left flex flex-col gap-2">
                <div className="text-[10px] text-muted tracking-widest uppercase mb-1">
                  Exemplos rápidos
                </div>
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(ex)}
                    className="text-left text-xs text-muted bg-bg2 border border-border rounded-lg px-4 py-3 hover:border-[#333] hover:text-off transition-all line-clamp-2"
                  >
                    {ex.slice(0, 100)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Mensagens */
          <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-red flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-white text-[9px] font-bold tracking-widest">DWV</span>
                </div>
                <div className="pt-1.5 flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-bg px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end bg-bg2 border border-border rounded-xl px-4 py-3 focus-within:border-[#333] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e.target) }}
              onKeyDown={handleKeyDown}
              placeholder="Cole os dados aqui..."
              rows={1}
              className="flex-1 bg-transparent text-off text-sm resize-none outline-none placeholder:text-muted leading-relaxed min-h-[24px] max-h-[200px]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 bg-red rounded-lg flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          {/* Hint */}
          {!isEmpty && (
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[10px] text-muted">
                Enter para enviar · Shift+Enter para nova linha
              </span>
              <div className="flex gap-4">
                {messages.some(m => m.role === 'assistant') && (
                  <button
                    onClick={() => exportToPDF(messages)}
                    disabled={loading}
                    className="text-[10px] text-muted hover:text-off disabled:opacity-30 transition-colors flex items-center gap-1"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v4h2v-4h3l-4-4-4 4h3z"/>
                    </svg>
                    Exportar PDF
                  </button>
                )}
                <button
                  onClick={() => sendMessage('Pode compilar os dados e criar as tabelas.')}
                  disabled={loading || messages.length < 2}
                  className="text-[10px] text-red hover:opacity-80 disabled:opacity-30 transition-opacity"
                >
                  Compilar e gerar tabelas →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex gap-3 items-start justify-end">
        <div className="max-w-xl bg-bg3 border border-border rounded-xl px-4 py-3 text-off text-sm leading-relaxed">
          {message.content.split('\n').map((line, i) => (
            <span key={i}>{line}{i < message.content.split('\n').length - 1 && <br/>}</span>
          ))}
        </div>
        <div className="w-7 h-7 rounded-full bg-bg3 border border-border flex-shrink-0 flex items-center justify-center text-muted text-xs mt-0.5">
          V
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-red flex-shrink-0 flex items-center justify-center mt-0.5">
        <span className="text-white text-[9px] font-bold tracking-widest">DWV</span>
      </div>
      <div
        className="flex-1 text-off text-sm leading-relaxed min-w-0"
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    </div>
  )
}
