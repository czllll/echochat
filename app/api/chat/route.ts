import { createChat } from "@/app/_actions/chat";
import { authConfig } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { chatTitle, botId } = body;
        if (!chatTitle?.trim() || !botId) {
            return new NextResponse("Chat title is required", { status: 400 });
        }

        const chat = await createChat(chatTitle, botId);
        
        if (!chat) {
            return new NextResponse("Failed to create chat", { status: 401 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.log("[CREATE_CHAT_API]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET() {
    try {
      const session = await getServerSession(authConfig)
      if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
  
      const chats = await prismadb.chat.findMany({
        where: {
          user: {
            email: session.user.email
          }
        },
        take: 4,
        orderBy: {
          updatedAt: 'desc'  
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
  
      return NextResponse.json(chats)
  
    } catch (error) {
      console.log('[CHATS_GET]', error)
      return new NextResponse("Internal error", { status: 500 })
    }
  }