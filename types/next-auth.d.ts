import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    relatedId?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      relatedId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id?: string;
    relatedId?: string;
  }
}
