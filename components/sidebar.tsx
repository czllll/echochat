"use client"
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Bolt, Bot, BotMessageSquare, CalendarCheck, Menu, MessagesSquare, UserRoundPen } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { Chat } from "@prisma/client";
import useSWR from 'swr';
import { useState } from "react";
import axios from "axios";
import { cn, formatDateTime } from "@/lib/utils";

const montserrat = Montserrat({
    weight: "600",
    subsets: ["latin"]
});

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const GithubIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-10 h-10"
    >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.489.5.091.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.607.069-.607 1.004.07 1.533 1.032 1.533 1.032.892 1.528 2.341 1.087 2.91.831.091-.647.35-1.087.636-1.338-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.982 1.029-2.68-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.024A9.563 9.563 0 0112 6.845c.851.004 1.705.115 2.505.337 1.909-1.293 2.748-1.024 2.748-1.024.546 1.376.202 2.393.099 2.646.64.698 1.028 1.589 1.028 2.68 0 3.841-2.338 4.687-4.566 4.935.359.309.678.921.678 1.855 0 1.34-.012 2.419-.012 2.747 0 .268.18.577.688.479C19.135 20.164 22 16.417 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
);

const routes = [
    {
        label: "All chats",
        icon: MessagesSquare,
        href: "/all-chats",
    },
    {
        label: "Your bots",
        icon: Bot,
        href: "/your-bots",
    },
    {
        label: "Subscribe",
        icon: CalendarCheck,
        href: "/subscribe",
    },
    {
        label: "Profile",
        icon: UserRoundPen,
        href: "/profile",
    },
    {
        label: "Settings",
        icon: Bolt,
        href: "/settings",
    },
];

interface SidebarProps {
    isRightSidebarOpen?: boolean;
    onRightSidebarToggle?: () => void;
}

const Sidebar = ({onRightSidebarToggle }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const params = useParams();
    const router = useRouter();
    
    const { data: chats } = useSWR<Chat[]>('/api/chat', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 10000,
    });

    const handleChatClick = (chatId: string) => {
        if (params?.chatId === chatId) return;
        router.push(`/chat/${chatId}`);
    };

    const handleMenuClick = () => {
        setIsCollapsed(!isCollapsed);
        if (onRightSidebarToggle) {
            onRightSidebarToggle();
        }
    };

    return (
        <div className={cn(
            "transition-all duration-300 ease-in-out border-r",
            isCollapsed ? "w-[80px]" : "w-[300px]"
        )}>
            <div className="flex flex-col h-full min-h-screen">
                <div className="flex items-center justify-between bg-gray-100 border-b h-[60px]">
                    <div className={cn(
                        "transition-opacity duration-300",
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                        <Link href="/dashboard" className="flex items-center p-3 space-x-2">
                            <div className="relative w-8 h-8">
                                <Image fill alt="Logo" src="/icons/logo.png"/>
                            </div>
                            <h1 className={`text-2xl ${montserrat.className}`}>
                                EchoChat
                            </h1>
                        </Link>
                    </div>

                    <div className={cn(
                        "items-center",
                        isCollapsed ? "w-full flex justify-center" : ""
                    )}>
                        <Button 
                            variant="ghost" 
                            className="justify-center"
                            onClick={handleMenuClick}
                        >
                            <Menu className={cn(
                                "transition-transform duration-300",
                                isCollapsed ? "rotate-180" : ""
                            )}/>
                        </Button>
                    </div>
                </div>
                
                <div className={cn(
                    "flex border-b",
                    isCollapsed ? "flex px-2 py-2" : "space-x-4 px-6 py-4"
                )}>
                    <Button className={cn(
                        "bg-gray-100 text-black hover:bg-black/10 pt-3",
                        isCollapsed ? "w-[50px] h-[50px] m-1" : "w-full"
                    )}>
                        <Link href="/explore">
                            <div className="flex items-center">
                                <div className="flex justify-start items-center">
                                    <BotMessageSquare style={{ width: '30px', height: '30px' }} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex items-center ml-2">
                                        <div className="text-md font-bold">
                                            New chat
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </Button>
                </div>

                {!isCollapsed && (                
                    <div className="flex flex-col py-2 border-b">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                            Recent Chats
                        </div>
                        <div className="space-y-1">
                            {chats?.map((chat) => (
                                <div 
                                    key={chat.id}
                                    onClick={() => handleChatClick(chat.id)}
                                    className={cn(
                                        "flex items-center hover:bg-gray-100 cursor-pointer",
                                        isCollapsed ? "px-2 py-2" : "px-6 py-2 space-x-3",
                                        params?.chatId === chat.id && "bg-gray-100"
                                    )}
                                >
                                    <MessagesSquare className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="truncate">
                                            {chat.title}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatDateTime(chat.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    {routes.map((route) => (
                        <Link href={route.href} key={route.href}>
                            <div className={cn(
                                "flex items-center border-b hover:bg-black/10",
                                isCollapsed ? "p-2 justify-center" : "p-4 space-x-4"
                            )}>
                                <div className={isCollapsed ? "" : "ml-2"}>
                                    <route.icon/>
                                </div>
                                {!isCollapsed && (
                                    <div className="font-bold">
                                        {route.label}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {!isCollapsed && (
                    <>
                        <div className="flex justify-center flex-grow">
                            <a href="https://github.com/czllll/echochat" 
                               className="flex items-center space-x-2 pb-4">
                                <div className="text-lg font-bold hover:text-cyan-700">
                                    Star this project on 
                                </div>
                                <GithubIcon/>
                            </a>
                        </div>
                        <div className="absolute bottom-2 left-14 text-gray-500 space-x-4">
                            <a href="">About</a>
                            <a href="">Term of Service</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;