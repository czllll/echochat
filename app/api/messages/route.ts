import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth" 
import axios from 'axios'
import { createMessages } from '@/app/_actions/message'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { chatId, messages } = body

    // 验证用户
    try {
      const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/users`, {
        params: {
          emailAddress: session.user.email,
        },
      })
      
      if (!response.data) {
        return new NextResponse("User not found", { status: 404 })
      }

      const chatResponse = await axios.get(`${process.env.NEXTAUTH_URL}/api/chat/${chatId}`)

      if (!chatResponse.data) {
        return new NextResponse("Chat not found", { status: 404 })
      }


      // 保存新消息
      const savedMessages = await createMessages(chatId, messages)
    
      if (!savedMessages) {
        return new NextResponse("Failed to save messages", { status: 500 })
      }
      console.log("===============================================保存信息")
      return NextResponse.json({ success: true })

    } catch (error) {
      console.error("API Error:", error)
      return new NextResponse("API Error", { status: 500 })
    }

  } catch (error) {
    console.log('[MESSAGES_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return new NextResponse("Chat ID required", { status: 400 })
    }

    const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/messages`, {
      params: {
        chatId,
        emailAddress: session.user.email,
      },
    })

    return NextResponse.json(response.data)

  } catch (error) {
    console.log('[MESSAGES_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
