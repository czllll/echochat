import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { modelId: string } }
) {
  try {
    await prismadb.modelTemplate.delete({
      where: { id: params.modelId }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}