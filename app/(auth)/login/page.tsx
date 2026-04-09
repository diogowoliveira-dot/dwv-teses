'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Erro ao fazer login')
    } else if (data.redirect) {
      router.push(data.redirect)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="font-serif text-4xl text-red mb-2">DWV</div>
          <div className="text-muted text-sm tracking-widest uppercase">Teses de Investimento</div>
        </div>

        {/* Card */}
        <div className="bg-bg2 border border-border rounded-xl p-8">
          <h1 className="font-serif text-xl text-off mb-2">Acesso à plataforma</h1>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Digite seu email e senha para acessar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-muted mb-2 tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-bg3 border border-border rounded-lg px-4 py-3 text-off text-sm outline-none focus:border-[#333] transition-colors placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-2 tracking-widest uppercase">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-bg3 border border-border rounded-lg px-4 py-3 text-off text-sm outline-none focus:border-[#333] transition-colors placeholder:text-muted"
              />
            </div>

            {error && (
              <p className="text-red text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-red text-white rounded-lg py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          por Diogo Westphal de Oliveira
        </p>
      </div>
    </div>
  )
}
