import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  }); 

export async function POST (req:Request) {
    try {
        const body = await req.json();
        const{messages} = body;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages
        });
        return NextResponse.json(response.choices[0].message)

    } catch(error) {
        console.log("[CONVERSATION_ERROR", error)
        return new NextResponse("Internal error", { status: 500});
    }
}