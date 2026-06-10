import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail, updateLastLogin, addAuditLog } from './db';

const getAllowedEmails = (): Set<string> => {
  const raw = process.env.ALLOWED_EMAILS || '';
  return new Set(raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean));
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@company.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const allowed = getAllowedEmails();

        if (allowed.size > 0 && !allowed.has(email)) {
          addAuditLog(email, 'login_denied', 'Email not in allowlist');
          return null;
        }

        const user = getUserByEmail(email);
        if (!user) {
          addAuditLog(email, 'login_failed', 'User not found');
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) {
          addAuditLog(email, 'login_failed', 'Invalid password');
          return null;
        }

        updateLastLogin(user.id);
        addAuditLog(email, 'login_success');

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
