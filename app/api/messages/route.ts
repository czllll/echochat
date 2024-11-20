import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"  // 使用你的 auth 配置
import axios from 'axios'

export async function POST(req: Request) {
  try {
    // 获取会话信息
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

      // 验证聊天所有权
      const chatResponse = await axios.get(`${process.env.NEXTAUTH_URL}/api/chats/${chatId}`, {
        params: {
          emailAddress: session.user.email,
        },
      })

      if (!chatResponse.data) {
        return new NextResponse("Chat not found", { status: 404 })
      }

      // 清除旧消息
      await axios.delete(`${process.env.NEXTAUTH_URL}/api/messages`, {
        data: {
          chatId,
          emailAddress: session.user.email,
        },
      })

      // 保存新消息
      await axios.post(`${process.env.NEXTAUTH_URL}/api/messages`, {
        chatId,
        emailAddress: session.user.email,
        messages: messages.map((message: { content: unknown; role: unknown }) => ({
          content: message.content,
          role: message.role,
        }))
      })

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

export async function DELETE(req: Request) {
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

    await axios.delete(`${process.env.NEXTAUTH_URL}/api/messages`, {
      data: {
        chatId,
        emailAddress: session.user.email,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.log('[MESSAGES_DELETE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}