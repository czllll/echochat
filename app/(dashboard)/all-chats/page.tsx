import Heading from "@/components/heading";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authConfig } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

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
        <div className="w-full mx-auto">
            <div className='sticky top-0 right-0 mb-8'>
                <Heading title="All Chats"/>
            </div>
            
            {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2"/>
                    <p className="text-muted-foreground">No chats yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-20 lg:px-32">
                    {chats.map((chat) => (
                        <Link href={`/chat/${chat.id}`} key={chat.id}>
                            <Card className="hover:shadow-md transition cursor-pointer h-[200px] flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span className="text-lg font-semibold truncate">
                                            {chat.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDateTime(chat.createdAt)}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {chat.messages[0] && (
                                        <div className="text-sm text-muted-foreground line-clamp-4 prose prose-sm">
                                            {chat.messages[0].content}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AllChatPage;