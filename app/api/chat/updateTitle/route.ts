import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import OpenAI from "openai";


export async function POST(req: Request) {
    try {
        const { chatId, botId, message } = await req.json();

        const bot = await prismadb.bot.findUnique({
            where: { 
              id: botId 
            },
          })
  
          if (!bot) {
            return new NextResponse("Bot not found", {status : 404 })
          }
  
          const openai = new OpenAI({
              apiKey: bot.apiKey,
              baseURL: bot.endpoint || 'https://api.openai.com/v1'
            })

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Generate a brief, concise title (max 6 words) for this conversation based on the user's message."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: bot.model,
        });

        const generatedTitle = completion.choices[0].message.content;

        const updatedChat = await prismadb.chat.update({
            where: { id: chatId },
            data: { title: generatedTitle }
        });

        return NextResponse.json(updatedChat);
    } catch (error) {
        console.error("[CHAT_TITLE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}