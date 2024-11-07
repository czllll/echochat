import { NextRequest, NextResponse } from 'next/server';
import { saveMessages } from '@/app/_actions/message';

export async function POST(request: NextRequest) {
  const { chatId, messages } = await request.json();

  try {
    const savedMessages = await saveMessages(chatId, messages);
    return NextResponse.json(savedMessages);
  } catch (error) {
    console.error("[SAVE_MESSAGES_ERROR]", error);
    return NextResponse.json({ error: 'Failed to save messages' }, { status: 500 });
  }
}

