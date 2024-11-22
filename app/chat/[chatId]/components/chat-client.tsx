'use client'

import Sidebar from '@/components/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/vs2015.css'
import { useEffect, useRef, useState } from 'react'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import axios from 'axios'
import type { Message, Chat } from "@prisma/client";
import { Pen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'




export default function ChatClient({ initialChat }: { initialChat: Chat }) {
    const [inputValue, setInputValue] = useState('')
    const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const [title, setTitle] = useState(initialChat.title)

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(initialChat.title)

    const handleEditClick = () => {
        setIsEditing(true)
        setEditTitle(title)
    }

    const handleTitleSubmit = async () => {
        try {
            await axios.patch(`/api/chat/${initialChat.id}`, {
                title: editTitle
            })
            setTitle(editTitle)
            setIsEditing(false)
            toast.success('Title updated successfully')
            router.refresh()
            mutate('/api/chat')
        } catch (error) {
            console.error('Failed to update title:', error)
            toast.error('Failed to update title')

        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSubmit()
        } else if (e.key === 'Escape') {
            setIsEditing(false)
            setEditTitle(title)
        }
    }

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
        const isFirstMessage = messages.length === 0;

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)
        setStreamingContent('')
    
        try {

            if (isFirstMessage) {
                try {
                    const titleResponse = await axios.post('/api/chat/updateTitle', {
                        chatId: initialChat.id,
                        botId: initialChat.botId,
                        message: inputValue
                    });
                    
                    if (titleResponse.data.title) {
                        setTitle(titleResponse.data.title);
                    }
                    mutate('/api/chat')
                } catch (error) {
                    console.error('Failed to update title:', error);
                }
            }

            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    botId: initialChat.botId
                }),
            })
            console.log("resp[][][][][][][][][][]ond",response)
    
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
                    console.log("hahahahahaa",text)
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
                            <code className="text-sm px-1 py-0.5 rounded-md bg-black text-gray-200 max-w-3xl" {...props}>
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
                <Sidebar 
                    isRightSidebarOpen={isRightSidebarOpen}
                    onRightSidebarToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
                    
                />
                <div className='flex-1 transition-all duration-300 w-full'>
                    <div className='flex flex-col'>
                    <div className='sticky top-0'>
                    <div className='flex items-center justify-center bg-gray-100 h-[60px] text-xl font-bold text-black border-b'>
                        {isEditing ? (
                            <div className="flex items-center">
                                <Input
                                    value={editTitle || ''}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="
                                            h-10 w-[200px] text-lg font-medium border-none 
                                            focus-visible:ring-0 bg-gray-50 placeholder:text-gray-40 shadow-none"
                                    autoFocus
                                    
                                />
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="ml-2"
                                    onClick={handleTitleSubmit}
                                >
                                    Save
                                </Button>
                            </div>
                        ) : (
                            <>
                                {title}
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="ml-4"
                                    onClick={handleEditClick}
                                >
                                    <Pen className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                        <div className="flex justify-center text-xl h-[calc(100vh-120px)] ">
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
                                                <div className="w-2 h-2 rounded-full bg-black animate-bounce" />
                                                <div className="w-2 h-2 rounded-full bg-black animate-bounce" 
                                                    style={{ animationDelay: '0.2s' }} />
                                                <div className="w-2 h-2 rounded-full bg-black animate-bounce" 
                                                    style={{ animationDelay: '0.4s' }} />
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='sticky bottom-0 left-0 right-0 px-4 bg-white'>
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