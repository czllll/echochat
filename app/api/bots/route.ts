import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from "@/lib/auth";

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

        // 首先查找用户
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

        const bot = await prismadb.bot.create({
            data: {
                model,
                endpoint,
                apiKey,
                name,
                user: {
                    connect: {
                        id: user.id
                    }
                },
                template: {
                    connect: {
                        id: templateId
                    }
                }
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