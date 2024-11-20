import { authConfig } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function createMessages(chatId: string, messages: ChatCompletionMessageParam[]) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user?.email) return null;
        
      const savedMessages = await prismadb.$transaction(
        messages.map(msg =>
          prismadb.message.create({
            data: {
              chatId,
              content: msg.content as string,
              role: msg.role
            }
          })
        )
      );
  
      return savedMessages;
    } catch (error) {
      console.error("[SAVE_MESSAGES_ERROR]", error);
      return null;
    }
  }


  export async function checkMessageisExisted(chatId: string): Promise<boolean> {
    const response = await prismadb.message.findFirst({
        where: {
            chatId
        }
    });
    
    return response !== null;
}

