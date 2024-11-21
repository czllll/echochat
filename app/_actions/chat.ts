import { authConfig } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from 'uuid';

export async function getChatById(chatId: string) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user?.email) {
        console.log("No session or user email found");
        return null;
      }
  
      console.log("User email:", session.user.email);
  
      const user = await prismadb.user.findUnique({
        where: { email: session.user.email }
      });
  
      if (!user) {
        console.log("User not found");
        return null;
      }
  
      console.log("User found:", user);
  
      const response = await prismadb.chat.findUnique({
        where: {
          id: chatId,
          userId: user.id
        }
      });
  
      console.log("Chat found:", response);
  
      return response;
    } catch (error) {
      console.log("[GET_CHAT_ERROR]", error);
      return null;
    }
  }

export async function createChat(chatTitle: string, botId: string) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) return null;

        const user = await prismadb.user.findUnique({
            where: {
                email: session.user.email
                
            }
        });
        if (!user) return null;

        const defaultBot = await prismadb.bot.findFirst();

        return await prismadb.chat.create({
          data: {
              id: uuidv4(),
              title: chatTitle,
              user: {
                  connect: {
                      id: user.id
                  }
              },
              bot: {
                  connect: {
                      id: botId
                  }
              }
          }
      });
    } catch (error) {
        console.log("[CREATE_CHAT_ACTION]", error);
        return null;
    }
}

