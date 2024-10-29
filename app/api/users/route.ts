import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { emailAddress, oauthProvider, oauthId } = await req.json();

        if (!emailAddress) {
            return NextResponse.json({ error: "Missing emailAddress" }, { status: 400 });
        }
        
        let user = await prismadb.user.findUnique({
            where:{
                email : emailAddress
            }
        });

        if (!user) {
            // 如果用户不存在，创建新用户
            user = await prismadb.user.create({
                data: { 
                    email : emailAddress,
                    name : emailAddress,
                    oauthProvider,
                    oauthId

                },
            });
        }
        return NextResponse.json({ message: "User created or already exists" }, { status: 200 });

    } catch (error) {
        console.log(error)
        return new NextResponse("[ERROR]", {status: 500})
    }
}