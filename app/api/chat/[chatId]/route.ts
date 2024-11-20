import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        console.log("00000000000")
        const chat = await prismadb.chat.findFirst({
            where: {
                id: params.chatId as string,
            },
            include: {
                messages: true
            }
        })

        if (!chat) {
            return new NextResponse("Chat not found", { status: 404 })
        }

        // 成功时返回数据
        return NextResponse.json(chat)
        
    } catch (error) {
        console.error("[CHAT_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        const body = await req.json()
        const { title } = body


        if (!params.chatId) {
            return new NextResponse("Chat ID is required", { status: 400 })
        }

        const chat = await prismadb.chat.update({
            where: {
                id: params.chatId,
            },
            data: {
                title
            }
        })

        return NextResponse.json(chat)
    } catch (error) {
        console.error('[CHAT_PATCH]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}