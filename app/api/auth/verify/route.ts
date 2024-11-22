import prismadb from "@/lib/prismadb"

export async function GET(request: Request) {
    try {
      const email = request.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!email) {
        return new Response('Unauthorized', { status: 401 })
      }
  
      const user = await prismadb.user.findUnique({
        where: { email }
      })
  
      if (!user) {
        return new Response('Unauthorized', { status: 401 })
      }
  
      return new Response('OK')
    } catch (error) {
      console.error('An error occurred:', error);
      return new Response('Internal Error', { status: 500 });
    }
  }