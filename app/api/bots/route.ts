import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from "@/lib/auth";
import { Encryption } from '@/lib/utils';


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authConfig);
        
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const body = await req.json();
        const { model, endpoint, apiKey, name, templateId } = body;

        if (!model || !endpoint || !apiKey || !name || !templateId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const user = await prismadb.user.findFirst({
            where: {
                email: session.user?.email
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const template = await prismadb.modelTemplate.findUnique({
            where: {
                id: templateId,
                isEnabled: true
            }
        });

        if (!template) {
            return new NextResponse("Invalid template", { status: 400 });
        }
        const {encrypted, iv} =  Encryption.encrypt(apiKey);
        const bot = await prismadb.bot.create({
            data: {
                model,
                endpoint,
                encryptedApiKey: encrypted,
                apiKeyIv: iv,
                name,
                userId: user.userId,
                templateId
            }
        });

        return NextResponse.json(bot);
    } catch (error) {
        console.log('[BOT_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authConfig);
        
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prismadb.user.findFirst({
            where: {
                email: session.user?.email
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const bots = await prismadb.bot.findMany({
            where: {
                userId: user.id
            },
            include: {
                template: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(bots);
    } catch (error) {
        console.log('[BOTS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}