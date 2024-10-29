import axios from "axios";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";



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
          async authorize(credentials, req) {
            const {code, email} = credentials;
            console.log("credentials",credentials);
            return {
              email: email,
              name: email,
              oauthProvider: "credentials",
            }
          }
        })
      ],

      pages: {
        signIn: '/sign-in'    
      },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt", 
    },
    callbacks: {
      async signIn({ user, account }) {
        if (!user?.email) {
          console.error("No email provided");
          return false;
        }
    
        // 检查用户是否存在
        const existingUser = await checkUserExists(user.email);
        if (existingUser) {
          return true;
        }
    
        // 用户不存在，创建新用户
        return await createNewUser({
          email: user.email,
          name: user.name || user.email || "",
          provider: account?.provider || "",
          providerId: account?.providerAccountId || "",
        });
      },
    
      async session({ session, token }) {
        return session;
      },
    
      async jwt({ token, user, account }) {

        return token;
      },
    },
    

    debug: process.env.NODE_ENV === 'development',
    // jwt: {
    //   encode: async function (params) {
    //     console.log("params", params)
    //     return "1";
    //   }
    // }
}


const getorCreateUserFromDb = async(email: string,code: string) => {
  const { data } = await axios.get(`${process.env.NEXTAUTH_URL}/api/customAuth/request-verification/?emailAddress=${email}`);

  const verificationCode = data.verificationCode;
  const expiresAt = data.expiresAt;
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  try {
    if (verificationCode === code && (expirationTime - currentTime <= 5 * 60 * 1000)) {
        //查询是否已有该用户
        const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/users`, {
          params: {
            emailAddress: email,
          },
        });
        const user = response.data
        console.log("user", user);
        if (!user) {
          const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/users`, { emailAddress: email });
          if (response.status !== 200) {
            throw new Error("User creation or validation failed.");
          }
          return response;
        } else {
          return user;
        }

      } else {
        throw new Error("Verification code is not correct or has been expired!");
      }
    }catch (error) {
      console.error("User creation or validation failed:", error);
  } 
}

    // 辅助函数
    async function checkUserExists(email) {
      try {
        const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/users`, {
          params: { emailAddress: email },
        });
        return response.status === 200;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return false;
        }
        throw error; 
      }
    }
    
    async function createNewUser({ email, name, provider, providerId }) {
      try {
        const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/users`, {
          emailAddress: email,
          name: name,
          oauthProvider: provider,
          oauthId: providerId,
        });
        return response.status === 200;
      } catch (error) {
        console.error("Failed to create user:", error);
        return false;
      }
    }