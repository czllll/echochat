import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = await prismadb.modelTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(models);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const model = await prismadb.modelTemplate.create({
      data: body
    });
    return NextResponse.json(model);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}