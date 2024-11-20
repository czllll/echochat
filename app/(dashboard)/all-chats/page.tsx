import Heading from "@/components/heading";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authConfig } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

const AllChatPage = async () => {
    const session = await getServerSession(authConfig);

    const chats = await prismadb.chat.findMany({
        where: {
            user: {
                email: session?.user?.email
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            title: true,
            createdAt: true,
            messages: {
                take: 1,
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    return (
        <div className="w-full mx-auto ">
            <div className='sticky top-0 right-0'>
                <Heading title="All Chats"/>
            </div>
            <div className="space-y-10 px-40">
                {chats.map((chat) => (
                    <Link href={`/chat/${chat.id}`} key={chat.id}>
                        <div className="p-4 rounded-md border hover:bg-gray-50 my-6">
                            <div className="flex items-center justify-between">
                                <span className="font-bold truncate ">{chat.title}</span>
                                <span className="text-sm text-gray-500">{formatDateTime(chat.createdAt)}</span>
                            </div>
                            <div>
                                {chat.messages[0] && (
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                                        {chat.messages[0].content}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AllChatPage;