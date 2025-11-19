import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Erreur: Email ou mot de passe manquant');
          throw new Error('Email et mot de passe requis');
        }

        console.log('🔍 Tentative de connexion pour:', credentials.email);

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          console.log('❌ Utilisateur non trouvé:', credentials.email);
          throw new Error('Aucun utilisateur trouvé avec cet email');
        }

        console.log('✅ Utilisateur trouvé:', user.email, '- Role:', user.role);
        console.log('📝 Mot de passe fourni:', credentials.password);
        console.log('📝 Mot de passe fourni (length):', credentials.password.length);
        console.log('📝 Hash stocké:', user.password);
        console.log('📝 Hash stocké (typeof):', typeof user.password);
        console.log('📝 Hash stocké (length):', user.password?.length);
        console.log('📝 Type de hash:', user.password?.substring?.(0, 4));

        // Convertir explicitement en string
        const passwordString = String(user.password);
        const credentialsPasswordString = String(credentials.password);

        console.log('🔄 Hash converti:', passwordString);
        console.log('� Password converti:', credentialsPasswordString);

        const isPasswordValid = await bcrypt.compare(
          credentialsPasswordString,
          passwordString
        );

        console.log('🔐 Mot de passe valide:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('❌ Mot de passe incorrect pour:', credentials.email);
          throw new Error('Mot de passe incorrect');
        }

        console.log('✅ Authentification réussie pour:', credentials.email);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          relatedId: user.relatedId?.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.relatedId = (user as any).relatedId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
        (session.user as any).relatedId = token.relatedId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
