'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Erro ao enviar email')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-serif text-4xl text-red mb-2">DWV</div>
          <div className="text-muted text-sm tracking-widest uppercase">Teses de Investimento</div>
        </div>

        <div className="bg-bg2 border border-border rounded-xl p-8">
          {!sent ? (
            <>
              <h1 className="font-serif text-xl text-off mb-2">Recuperar senha</h1>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs text-muted mb-2 tracking-widest uppercase">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-bg3 border border-border rounded-lg px-4 py-3 text-off text-sm outline-none focus:border-[#333] transition-colors placeholder:text-muted"
                  />
                </div>

                {error && <p className="text-red text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-red text-white rounded-lg py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-3xl mb-4">&#x2709;</div>
              <h2 className="font-serif text-lg text-off mb-2">Email enviado</h2>
              <p className="text-muted text-sm leading-relaxed">
                Verifique seu email <strong className="text-off">{email}</strong> e clique no link para redefinir sua senha.
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs text-muted hover:text-off transition-colors">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
