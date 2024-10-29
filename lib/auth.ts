import axios from "axios";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"


export const authConfig: NextAuthOptions = {
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        })
      ],
      pages: {
        signIn: '/sign-in'    
      },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {

            const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/users`, {
                emailAddress: user.email,
                name: profile.name,
                oauthProvider: account?.provider,
                oauthId: account?.providerAccountId,
            });
            if (response.status !== 200) {
                return false;
            }
            return true

        },
        async session({ session, token, user }) {
        return session;
        },
        async jwt({ token, user, account, profile }) {
        return token;
        },
    }, 
    debug: process.env.NODE_ENV === 'development',
}
