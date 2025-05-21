'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { supabaseBrowser } from '@/lib/supabase-browser'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useFormStatus } from '@/hooks/use-form-status'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = supabaseBrowser
  const { isLoading, error, start, setError, stop } = useFormStatus()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    console.log('SignUpForm: mounted')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    start()
    console.log('SignUpForm: attempting sign up', { email, fullName })

    const { data, error } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber || undefined,
          },
        },
      }
    )
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setError(error.message)
      console.error('SignUpForm: sign up error', error)
    } else {
      toast({
        title: 'Registro exitoso',
        description: 'Por favor, revisa tu correo para confirmar tu cuenta',
      })
      console.log('SignUpForm: sign up successful', data)
      router.push('/login')
    }
    stop()
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}