import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, magicLinkEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const supabase = createClient()

    // Gerar magic link via Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error('Supabase OTP error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Enviar email customizado via SparkPost
    // Nota: O Supabase também envia seu próprio email. Para usar APENAS o SparkPost,
    // desabilite os emails do Supabase em: Dashboard > Auth > Email Templates > desabilitar
    // e use o token gerado aqui para construir o link manualmente.

    // Por ora, o Supabase cuida do envio. SparkPost será usado para emails transacionais
    // como boas-vindas, notificações etc.

    return NextResponse.json({ success: true, message: 'Link enviado para ' + email })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
