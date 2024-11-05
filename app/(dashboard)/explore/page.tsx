import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";

const bots = [
    {
        avatar:"/logo.png",
        name:"GPT-4o",
        description:"OpenAI's most powerful model. Stronger than GPT-3.5 in quantitative questions (math and physics), creative writing, and many other challenging tasks. Powered by GPT-4o. Context window has been shortened to optimize for speed and cost. For longer context messages, please try GPT-4o-128k."
    }
]

const allChatPage = async({children}: {children: React.ReactNode;}) => {
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
                            <Link href={{
                                pathname: `/bots/${bot.name}`,
                                query: {
                                    avatar: bot.avatar,
                                    botName: bot.name,
                                }
                            }}>
                                <div className="flex flex-row space-x-4 ">
                                    <div className="relative w-20 h-20">
                                        <Image fill src={bot.avatar} alt={`${bot.name} avatar`}/>
                                    </div>
                                    <div className="flex flex-col space-y-1 w-5/6">
                                        <div className="font-bold text-lg">
                                            {bot.name}
                                        </div>
                                        <div className="text-ellipsis whitespace-pre-wrap line-clamp-2">
                                            {bot.description}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            ))}
                        
                    </div>
                
                </div>

            </div>



        </div>
    )
}
export default allChatPage;