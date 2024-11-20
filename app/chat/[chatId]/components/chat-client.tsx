'use client'

import Sidebar from '@/components/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css' 
import { useEffect, useRef, useState } from 'react'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import axios from 'axios'
import type { Message } from "@prisma/client";

interface Chat {
    id: string
    title: string | null
    messages?: unknown[]
}



export default function ChatClient({ initialChat }: { initialChat: Chat }) {
    const [inputValue, setInputValue] = useState('')
    const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/messages?chatId=${initialChat.id}`)
                const historicalMessages = response.data.map((msg: Message) => ({
                    role: msg.role,
                    content: msg.content
                }))
                setMessages(historicalMessages)
            } catch (error) {
                console.error('Failed to fetch messages:', error)
            }
        }

        fetchMessages()
    }, [initialChat.id])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: "smooth",
                block: "end" 
            })
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingContent])

    async function chatWithBot() {
        if (!inputValue.trim()) return
    
        const userMessage: ChatCompletionMessageParam = {
            role: 'user',
            content: inputValue
        }
        
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)
        setStreamingContent('')
    
        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                }),
            })
    
            if (!response.ok) {
                throw new Error('Response error')
            }
    
            let accumulatedContent = ''
    
            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('No reader available')
            }
    
            const decoder = new TextDecoder()
    
            try {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
    
                    const text = decoder.decode(value)
                    const lines = text.split('\n')
                    
                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue
                        
                        const data = line.slice(6)
                        
                        if (data === '[DONE]') continue
    
                        try {
                            const json = JSON.parse(data)
                            const content = json.choices[0]?.delta?.content || ''
                            accumulatedContent += content
                            setStreamingContent(accumulatedContent)
                        } catch (error) {
                            console.error('Error parsing JSON:', error)
                        }
                    }
                }
            } finally {
                reader.releaseLock()
            }
    
            const aiMessage: ChatCompletionMessageParam = {
                role: 'assistant',
                content: accumulatedContent
            }
    
            setMessages(prev => [...prev, aiMessage])
            setStreamingContent('')
    
            try {
                await axios.post('/api/messages', {
                    chatId: initialChat.id,
                    messages: [userMessage, aiMessage],
                })
            } catch (error) {
                console.error('[SAVE_MESSAGES_ERROR]', error)
            }
    
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
            e.preventDefault()
            chatWithBot()
        }
    }

    const MessageContent = ({ content }: { content: string }) => (
        <ReactMarkdown 
            className="prose max-w-none"
            rehypePlugins={[rehypeHighlight]}
            components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                code({inline = false, className, children, ...props} :  React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                    if (inline) {
                        return (
                            <code className="text-sm px-1 py-0.5 rounded-md bg-gray-800 text-gray-200 max-w-3xl" {...props}>
                                {children}
                            </code>
                        )
                    }
                    const match = /language-(\w+)/.exec(className || '')
                    return (
                        <div className="relative max-w-5xl overflow-auto">
                            {match && (
                                <div className="absolute right-2 top-2 text-xs text-gray-400">
                                    {match[1]}
                                </div>
                            )}
                            <code className={className} {...props}>
                                {children}
                            </code>
                            

                        </div>
                    )
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )

    return (
        <div>
            <div className='flex h-full'>
                <div className='hidden h-full md:flex md:w-[300px] md:flex-col md:fixed md:inset-y-0 border-r'>
                    <Sidebar />
                </div>
                <div className='flex-1 ml-[300px]'>
                    <div className='flex flex-col'>
                        <div className='fixed top-0 left-[300px] right-0'>
                            <div className='flex items-center justify-center bg-gray-100 h-[60px] text-xl font-bold text-gray-700 border-b'>
                                {initialChat.title}
                            </div>
                        </div>

                        <div className="flex justify-center text-xl h-[calc(100vh-180px)] mt-[60px] mb-[80px]">
                            <div className="w-full h-full">
                                <div className="h-full px-20 overflow-y-auto">
                                    <div className="space-y-4 py-4">
                                        {messages.map((message, index) => (
                                            <div className="flex flex-col" key={index}>
                                                {message.role !== "user" && (
                                                    <div className="text-sm text-gray-500 font-semibold">
                                                        Assistant
                                                    </div>
                                                )}
                                                <div
                                                    className={`${
                                                        message.role === "user"
                                                            ? "bg-gray-100 self-end px-4 py-2 rounded-md"
                                                            : "self-start py-2 pr-10 rounded-md"
                                                    }`}
                                                >
                                                    <MessageContent content={String(message.content)} />
                                                </div>
                                            </div>
                                        ))}

                                        {streamingContent && (
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-500 font-semibold">
                                                    Assistant
                                                </div>
                                                <div className="self-start py-2 pr-10 rounded-md">
                                                    <MessageContent content={streamingContent} />
                                                </div>
                                            </div>
                                        )}

                                        {isLoading && !streamingContent && (
                                            <div className="flex items-center justify-start space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-800 animate-bounce" />
                                                <div className="w-2 h-2 rounded-full bg-gray-800 animate-bounce" 
                                                    style={{ animationDelay: '0.2s' }} />
                                                <div className="w-2 h-2 rounded-full bg-gray-800 animate-bounce" 
                                                    style={{ animationDelay: '0.4s' }} />
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='fixed ml-[300px] bottom-0 left-0 right-0 border-t p-4'>
                            <div className='flex gap-2 items-center'>
                                <Input
                                    placeholder={`Send a message...`}
                                    className='flex-1 h-12 rounded-full'
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    disabled={isLoading}
                                />
                                <Button 
                                    type="submit" 
                                    className='h-12' 
                                    onClick={chatWithBot}
                                    disabled={isLoading}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}