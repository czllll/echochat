import { createChat } from "@/app/_actions/chat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { chatTitle } = body;

        if (!chatTitle?.trim()) {
            return new NextResponse("Chat title is required", { status: 400 });
        }

        const chat = await createChat(chatTitle);
        
        if (!chat) {
            return new NextResponse("Failed to create chat", { status: 401 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.log("[CREATE_CHAT_API]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}