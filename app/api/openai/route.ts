import prismadb from '@/lib/prismadb'
import { Encryption } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
    try {
        const { messages, botId } = await req.json()
       const bot = await prismadb.bot.findUnique({
          where: { 
            id: botId 
          },
        })

        if (!bot) {
          return new NextResponse("Bot not found", {status : 404 })
        }
        
        const apiKey = Encryption.decrypt(bot.encryptedApiKey, bot.apiKeyIv)
        const openai = new OpenAI({
            apiKey,
            baseURL: bot.endpoint || 'https://api.openai.com/v1'
          })



          const stream = await openai.chat.completions.create({
            model: bot.model,
            messages,
            stream: true,
            temperature: 0.7,
          })
      
          const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const data = chunk.choices[0]?.delta?.content || ''
                    if (data) {
                        // 发送数据
                        controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
                    }
                }
                controller.enqueue('data: [DONE]\n\n')
                controller.close()
            }
        })

        return new Response(readable, {
          headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
          },
      })

    } catch (error) {
        console.error('[OPENAI_ERROR]', error)
        return new Response('Error', { status: 500 })
    }
}