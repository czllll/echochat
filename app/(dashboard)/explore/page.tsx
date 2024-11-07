"use client"
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Search } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

const bots = [
    {
        avatar:"/logo.png",
        name:"GPT-4o",
        description:"OpenAI's most powerful model. Stronger than GPT-3.5 in quantitative questions (math and physics), creative writing, and many other challenging tasks. Powered by GPT-4o. Context window has been shortened to optimize for speed and cost. For longer context messages, please try GPT-4o-128k."
    }
]


const AllChatPage = ({children}: {children: React.ReactNode;}) => {
    const router = useRouter();


    const createChat = async() => {
        try {
            const response = await axios.post('/api/chat', {
                chatTitle: "title11"
            })
            const chatId = response.data.id;
            router.push(`/chat/${chatId}`);
          } catch (error) {
            console.log('[CREATE_CHAT_ERROR]', error)
          }
    }

    return (
        <div>
            <Heading title="Explore"/>
            <div className="flex flex-col">
                <div className="px-16 py-8">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <Search className="w-5 h-5" />
                        </span>
                        <Input
                            placeholder="Search for bots or people"
                            className="pl-10 rounded-full border border-gray-300 h-10"
                        />
                    </div>
                    <div className="spacey-4 border-b py-4 hover:bg-black/10">
                        
                        {bots.map((bot) => (
                            <Dialog key={bot.name}>
                                <DialogTrigger asChild>
                                <div className="flex flex-row space-x-4 cursor-pointer">
                                    <div className="relative w-20 h-20">
                                    <Image fill src={bot.avatar} alt={`${bot.name} avatar`} />
                                    </div>
                                    <div className="flex flex-col space-y-1 w-5/6">
                                    <div className="font-bold text-lg">{bot.name}</div>
                                    <div className="text-ellipsis whitespace-pre-wrap line-clamp-2">{bot.description}</div>
                                    </div>
                                </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{bot.name}</DialogTitle>
                                            <DialogDescription>
                                            <div className="relative w-20 h-20 mx-auto">
                                                <Image fill src={bot.avatar} alt={`${bot.name} avatar`} />
                                            </div>
                                            <p className="mt-4">{bot.description}</p>
                                            </DialogDescription>
                                    </DialogHeader>
                                    <Button onClick={createChat}>
                                        try it
                                    </Button>
                                </DialogContent>
                            </Dialog>
                            ))}
                        
                    </div>
                
                </div>

            </div>



        </div>
    )
}
export default AllChatPage;