import CredentialsProviderImport from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';

import prisma from './prisma.js';

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

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 hours
    updateAge: 1 * 60 * 60, // 1 hour (sliding update)
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
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
