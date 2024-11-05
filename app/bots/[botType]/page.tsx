"use client"
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';

interface BotTypeProps {
    avatar: string;
    botName: string;
    chatname: string;
}


const BotTypePage =() => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const avatar = searchParams.get('avatar');
    const botName = searchParams.get('botName');
    const chatname = searchParams.get('chatname');
    return (
        <div>
            <div className="flex h-full">
                <div className="hidden h-full md:flex md:w-[300px] md:flex-col md:fixed md:inset-y-0 border-r">
                    <Sidebar/>
                </div>
                <div className="flex-1 ml-[300px]">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-center bg-gray-100 h-[60px] text-xl font-bold text-gray-700 border-b">
                            <div className="relative w-10 h-10">
                                <Image fill src={`${avatar}`} alt="avatar" />
                            </div>
                            {botName}
                            
                        </div>

                        <div className="fixed ml-[300px] bottom-0 left-0 right-0 border-t p-4">
                            <div className="flex gap-2 items-center ">
                                <Input 
                                    placeholder={`talk to ${botName} or @ a bot`}
                                    className="flex-1 h-12 rounded-full"
                                />
                                <Button className="h-12">发送</Button>
                            </div>
                        </div>
                    </div>

                </div>


                </div>
        </div>
    )
}
export default BotTypePage;