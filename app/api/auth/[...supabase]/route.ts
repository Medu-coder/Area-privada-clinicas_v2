import { handleAuth } from '@supabase/auth-helpers-nextjs'

export const GET = handleAuth({
  logout: '/login',
  updatePassword: '/update-password',
})

export const POST = GET