'use client'
import Sidebar from '@/components/sidebar'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import axios from 'axios'

const ChatPage = () => {
  const searchParams = useSearchParams()
  const [inputValue, setInputValue] = useState('')
  const msg = searchParams.get('message')
  const avatar = searchParams.get('avatar')
  const botName = searchParams.get('botName')
  const chatName = searchParams.get('chatName')
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])

  async function chatWithBot () {
    const userMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: inputValue
    }
    const newMessages = [...messages, userMessage]
    const response = await axios.post('/api/openai', {
      messages: newMessages
    })
    setMessages(current => [...current, userMessage, response.data])
    setInputValue("")
  }

  return (
    <div>
      <div className='flex h-full'>
        <div className='hidden h-full md:flex md:w-[300px] md:flex-col md:fixed md:inset-y-0 border-r'>
          <Sidebar />
        </div>
        <div className='flex-1 ml-[300px]'>
          <div className='flex flex-col'>
            <div className='flex items-center justify-center bg-gray-100 h-[60px] text-xl font-bold text-gray-700 border-b'>
              <div className='relative w-10 h-10'>
                <Image fill src={`${avatar}`} alt='avatar' />
              </div>
              {botName}
            </div>
            <div className='flex justify-center text-xl min-h-screen pt-10'>
              <div className='flex flex-col w-full px-20 space-y-4'>
                {messages.map(message => (
                  <div className='flex flex-col'>
                    {message.role !== 'user' && (
                      <div className='text-sm text-gray-500 font-semibold'>
                        {botName}
                      </div>
                    )}
                    <div
                      className={`${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white self-end px-4 py-2 rounded-md'
                          : 'bg-gray-200 text-black self-start px-4 py-2 rounded-md'
                      }`}
                    >
                      <div></div>
                      {String(message.content)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='fixed ml-[300px] bottom-0 left-0 right-0 border-t p-4'>
              <div className='flex gap-2 items-center '>
                <Input
                  placeholder={`talk to ${botName} or @ a bot`}
                  className='flex-1 h-12 rounded-full'
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <Button type="submit" className='h-12' onClick={chatWithBot}>
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ChatPage
