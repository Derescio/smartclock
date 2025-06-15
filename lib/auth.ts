import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { AuthUser } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            organization: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (!user.isActive || !user.organization.isActive) {
          return null
        }

        // Check if organization trial has expired and billing status
        if (user.organization.billingStatus === 'TRIAL' && user.organization.trialEndsAt && new Date() > user.organization.trialEndsAt) {
          return null // Trial expired
        }

        if (['CANCELED', 'SUSPENDED'].includes(user.organization.billingStatus)) {
          return null // Organization suspended
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          locationId: user.locationId || undefined,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          organizationSlug: user.organization.slug,
          planType: user.organization.planType,
          billingStatus: user.organization.billingStatus
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.locationId = user.locationId
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
        token.organizationSlug = user.organizationSlug
        token.planType = user.planType
        token.billingStatus = user.billingStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.locationId = token.locationId
        session.user.organizationId = token.organizationId
        session.user.organizationName = token.organizationName
        session.user.organizationSlug = token.organizationSlug
        session.user.planType = token.planType
        session.user.billingStatus = token.billingStatus
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
} 