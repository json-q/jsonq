import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub as never],
  // session:{
  //   maxAge: 60 * 60 * 24,
  // },
  callbacks: {
    session(params) {
      return { ...params.session };
    },
  },
  secret: process.env.AUTH_SECRET,
});
