'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmResetPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      console.error('Update password error:', error)
      setError('Erro ao atualizar senha. O link pode ter expirado.')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/chat'), 2000)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-serif text-4xl text-red mb-2">DWV</div>
          <div className="text-muted text-sm tracking-widest uppercase">Teses de Investimento</div>
        </div>

        <div className="bg-bg2 border border-border rounded-xl p-8">
          {!success ? (
            <>
              <h1 className="font-serif text-xl text-off mb-2">Nova senha</h1>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs text-muted mb-2 tracking-widest uppercase">
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full bg-bg3 border border-border rounded-lg px-4 py-3 text-off text-sm outline-none focus:border-[#333] transition-colors placeholder:text-muted"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs text-muted mb-2 tracking-widest uppercase">
                    Confirmar senha
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    className="w-full bg-bg3 border border-border rounded-lg px-4 py-3 text-off text-sm outline-none focus:border-[#333] transition-colors placeholder:text-muted"
                  />
                </div>

                {error && <p className="text-red text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-red text-white rounded-lg py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-3xl mb-4">&#x2705;</div>
              <h2 className="font-serif text-lg text-off mb-2">Senha atualizada</h2>
              <p className="text-muted text-sm leading-relaxed">
                Redirecionando para o chat...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
