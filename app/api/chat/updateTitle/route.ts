import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import OpenAI from "openai";

const openai = new OpenAI({
    // apiKey: process.env.OPEN_API_KEY,
    apiKey: process.env.NEW_API_KEY,
    baseURL: 'http://localhost:3000/v1'
})

export async function POST(req: Request) {
    try {
        const { chatId, message } = await req.json();

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
            model: "gpt-3.5-turbo",
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