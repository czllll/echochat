import prismadb from "@/lib/prismadb"
import { NextResponse } from 'next/server'
import { Encryption } from '@/lib/utils'
import { handleOpenAI } from "@/app/api/adapter/providers/openai"

export async function POST(request: Request) {
    try {
        const { messages, botId } = await request.json()

        if (!messages || !botId) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const bot = await prismadb.bot.findUnique({
            where: { id: botId },
            include: { template: true }
        })

        if (!bot || !bot.template) {
            return new NextResponse("Bot or template not found", { status: 404 })
        }

        if (!bot.template.isEnabled) {
            return new NextResponse("Model is currently disabled", { status: 400 })
        }

        const apiKey = Encryption.decrypt(bot.encryptedApiKey, bot.apiKeyIv)
        switch (bot.template.provider.toLowerCase()) {
            case 'openai':
                return await handleOpenAI(bot, bot.template, messages, apiKey)
            // case 'anthropic':
            //     return await handleAnthropic(bot, bot.template, messages, apiKey)
            default:
                return new NextResponse(`Unsupported provider: ${bot.template.provider}`, { status: 400 })
        }

    } catch (error) {
        console.error('[ADAPTER_ERROR]', error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}