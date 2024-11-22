import Heading from "@/components/heading";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authConfig } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Plus, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { redirect } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { createChatAction } from "./action";

const BotsPage = async () => {
    const session = await getServerSession(authConfig);

    const bots = await prismadb.bot.findMany({
        where: {
            user: {
                email: session?.user?.email
            }
        },
        include: {
            template: true,
            chats: {
                select: {
                    id: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    return (
        <div className="w-full mx-auto">
            <div className='sticky top-0 right-0 mb-8 bg-white z-10'>
                <div className="absolute top-3 right-24">
                    <Link href="/explore">
                        <Button>
                            <Plus className="w-4 h-4 mr-2"/>
                            New Bot
                        </Button>
                    </Link>
                </div>
                <Heading title="Your bots"/>
            </div>

            
            {bots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <p className="text-muted-foreground mb-4">No bots created yet</p>
                    <Link href="/bots/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2"/>
                            Create your first bot
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-20 lg:px-32">
                    {bots.map((bot) => (
                        <Card key={bot.id} className="hover:shadow-md transition">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span className="truncate">{bot.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {bot.chats.length} chats
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    {bot.template.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-x-2">
                                        <span className="font-medium">Model:</span>
                                        <span>{bot.model}</span>
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        <span className="font-medium">Created:</span>
                                        <span>{formatDateTime(bot.createdAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-x-2">
                                <Link href={`/bots/${bot.id}/settings`}>
                                    <Button variant="outline" size="sm">
                                        <Settings className="w-4 h-4 mr-2"/>
                                        Settings
                                    </Button>
                                </Link>
                                <form
                                    action={async () => {
                                        'use server'
                                        const chat = await createChatAction(bot.id);
                                        if (chat) {
                                            redirect(`/chat/${chat.id}`);
                                        }
                                    }}
                                >
                                    <Button size="sm" type="submit">
                                        <MessageSquare className="w-4 h-4 mr-2"/>
                                        Chat
                                    </Button>
                                </form>

                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BotsPage;