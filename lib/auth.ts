import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prismadb from "./prismadb";

export const authConfig: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {},
                code: {}
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    throw new Error("Email is required");
                }

                return {
                    id: credentials.email,
                    email: credentials.email,
                    name: credentials.email,
                    provider: "credentials",
                };
            }
        })
    ],

    pages: {
        signIn: '/sign-in'    
    },
    
    secret: process.env.NEXTAUTH_SECRET,
    
    session: {
        strategy: "jwt", 
        maxAge: 24 * 60 * 60,
    },
    
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (!user?.email) {
                    console.error("No email provided");
                    return false;
                }
                await prismadb.user.upsert({
                    where: { 
                        email: user.email 
                    },
                    create: {
                        email: user.email,
                        name: user.name || user.email,
                        oauthProvider: account?.provider || "credentials",
                        oauthId: account?.providerAccountId || "",
                    },
                    update: {
                        email: user.email,
                        name: user.name || user.email,
                        oauthProvider: account?.provider || "credentials",
                        oauthId: account?.providerAccountId || "",
                    }
                });

                return true; 
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },

        async session({ session }) {
            try {
                if (session?.user?.email) {
                    const dbUser = await prismadb.user.findUnique({
                        where: { 
                            email: session.user.email 
                        },
                        select: {
                            id: true,
                            email: true,
                            name: true,

                        }
                    });

                    return {
                        ...session,
                        user: {
                            ...session.user,
                            ...dbUser
                        }
                    };
                }
                return session;
            } catch (error) {
                console.error("Error in session callback:", error);
                return session;
            }
        },

        async jwt({ token, user, account }) {
            if (user) {
                // 可以在token中添加额外信息
                token.provider = account?.provider;
                // 其他需要存储在token中的信息
            }
            return token;
        }
    },
    jwt: {
        maxAge: 24 * 60 * 60, 
        secret: process.env.NEXTAUTH_SECRET,
      },
    
    debug: process.env.NODE_ENV === 'development',
};