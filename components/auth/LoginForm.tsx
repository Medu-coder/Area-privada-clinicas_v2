'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFormStatus } from '@/hooks/use-form-status'

export function LoginForm() {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { isLoading, error, start, setError, stop } = useFormStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    start()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('LoginForm: sign in error', signInError)
      setError(signInError.message)
      return
    }

    stop()
    router.push('/')
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando…' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}