import { DefaultSession, DefaultUser } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      locationId?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: UserRole
    locationId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    locationId?: string
  }
} 