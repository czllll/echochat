'use server'

import { createChat  as createChatDB} from "@/app/_actions/chat";

export async function createChatAction(botId: string) {
    return await createChatDB("New chat", botId);
}