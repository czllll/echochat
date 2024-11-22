import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = await prismadb.modelTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(models);
  } catch (error) {
    console.error('An error occurred:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("body", body)
    const model = await prismadb.modelTemplate.create({
      data: body
    });
    return NextResponse.json(model);
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 });
  }
}