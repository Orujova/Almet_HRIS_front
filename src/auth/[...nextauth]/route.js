// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth/next";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: "230458ff-ed69-4abb-8496-3888067116f6",
      clientSecret: "", // Production-da empty (boş) buraxmayın
      tenantId: "b3222ef7-242d-4724-a665-97b0a764f2d0",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Token-ə əlavə məlumatlar əlavə edə bilərsiniz
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Session-a əlavə məlumatlar əlavə edin
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      
      // Backend API-ə göndərmək üçün
      session.backendTokens = {
        accessToken: token.accessToken,
        idToken: token.idToken,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };