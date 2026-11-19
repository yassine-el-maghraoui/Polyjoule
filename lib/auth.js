import CredentialsProviderImport from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

import prisma from './prisma.js';

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const LOGIN_ERRORS = {
  temporaryPasswordExpired: 'TemporaryPasswordExpired',
};

let dummyHashPromise;
function getDummyHash() {
  dummyHashPromise ??= bcrypt.hash(randomBytes(16).toString('hex'), 12);
  return dummyHashPromise;
}

const CredentialsProvider =
  CredentialsProviderImport?.default ?? CredentialsProviderImport;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (!user) {
          await bcrypt.compare(credentials.password, await getDummyHash());
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await bcrypt.compare(credentials.password, await getDummyHash());
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          const { failedLoginAttempts } = await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: { increment: 1 } },
            select: { failedLoginAttempts: true },
          });
          if (failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) },
            });
          }
          return null;
        }

        if (
          user.mustChangePassword &&
          user.temporaryPasswordExpiresAt &&
          user.temporaryPasswordExpiresAt < new Date()
        ) {
          throw new Error(LOGIN_ERRORS.temporaryPasswordExpired);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          sessionVersion: user.passwordChangedAt.getTime(),
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60,
    updateAge: 1 * 60 * 60,
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.mustChangePassword = user.mustChangePassword;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        mustChangePassword: token.mustChangePassword,
        sessionVersion: token.sessionVersion,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser({ allowPendingPasswordChange = false } = {}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      mustChangePassword: true,
      passwordChangedAt: true,
    },
  });
  if (!user || session.user.sessionVersion !== user.passwordChangedAt.getTime()) {
    return null;
  }
  if (user.mustChangePassword && !allowPendingPasswordChange) {
    return null;
  }

  const { passwordChangedAt, ...currentUser } = user;
  return currentUser;
}
