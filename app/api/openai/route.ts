import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        const stream = new ReadableStream({
            async start(controller) {
                const sendData = (data: string) => {
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                }

                try {
                    const response = await openai.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        stream: true,
                        messages: messages,
                    })

                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || ''
                        if (content) {
                            sendData(JSON.stringify({
                                choices: [{ delta: { content } }]
                            }))
                        }
                    }

                    // 发送结束信号
                    sendData('[DONE]')
                    controller.close()
                } catch (error) {
                    controller.error(error)
                }
            }
        })

        return new Response(stream, {
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