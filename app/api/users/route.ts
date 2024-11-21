import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
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
