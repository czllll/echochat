import { Bot, ModelTemplate } from '@prisma/client'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';


export async function handleOpenAI(
    bot: Bot,
    template: ModelTemplate,
    messages: ChatCompletionMessageParam[],
    apiKey: string,
) {
    const openai = new OpenAI({
        apiKey,
        baseURL: bot.endpoint || template.baseEndpoint,
        defaultQuery: {
            api_key: apiKey
        },
        timeout: 30000, // 30 seconds timeout
    });

    const stream = await openai.chat.completions.create({
        model: bot.model || template.name,
        messages,
        stream: true,
        temperature: 0.7,
    });

    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    if (chunk?.choices?.[0]?.delta?.content) {
                        controller.enqueue(
                            `data: ${JSON.stringify({
                                choices: [{
                                    delta: {
                                        content: chunk.choices[0].delta.content
                                    }
                                }]
                            })}\n\n`
                        );
                    }
                }
                controller.enqueue('data: [DONE]\n\n');
                controller.close();
            } catch (error) {
                console.error('[STREAM_ERROR]', error);
                controller.error(error);
            }
        }
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}