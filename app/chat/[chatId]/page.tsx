import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ChatClient from "./components/chat-client";
import { getChatById } from "@/app/_actions/chat";

export default async function ChatPage({ params }: { params: { chatId: string } }) {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
        return <div>Please sign in</div>;
    }
    const chat =  await getChatById(params.chatId)
    if (!chat) {
        return <div>Chat not found</div>;
    }

    return <ChatClient initialChat={chat} />;
}