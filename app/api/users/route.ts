import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { emailAddress, oauthProvider, oauthId } = await req.json();

        if (!emailAddress) {
            return NextResponse.json({ error: "Missing emailAddress" }, { status: 400 });
        }
        const user = await prismadb.user.create({
            data: { 
                email : emailAddress,
                name : emailAddress,
                oauthProvider,
                oauthId
                },
            });
        
        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.log(error)
        return new NextResponse("[CREATE_USER_ERROR]", {status: 500})
    }
}

export async function GET(req: Request) {
    try {
      const url = new URL(req.url); 
      const emailAddress = url.searchParams.get("emailAddress"); 
      // const oauthProvider = url.searchParams.get("oauthProvider");
      // const oauthId = url.searchParams.get("oauthId");
  
      if (!emailAddress) {
        return new NextResponse("[MISSING_EMAIL_ADDRESS]", { status: 400 });
      }
  
      // 查找用户
      const user = await prismadb.user.findUnique({
        where: {
          email: emailAddress,
        },
      });
  
      if (!user) {
        return new NextResponse("[USER_NOT_FOUND]", { status: 404 });
      }
  
      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      console.error(error);
      return new NextResponse("[FIND_USER_ERROR]", { status: 500 });
    }
  }