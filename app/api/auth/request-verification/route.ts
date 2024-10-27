import { sendEmail } from '@/lib/sesClient';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {


    const verificationCode = generateVerificationCode();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const createAt = new Date(Date.now());
    const { emailAddress } = await req.json();

    const toAddress = emailAddress;
    const fromAddress = process.env.AWS_SES_FROM_ADDRESS || "";
    const subject = "Your Verification Code";
    const htmlBody = `<h1>Your verification code is ${verificationCode}</h1><p>This code will expire in 5 minutes.</p>`;
    const textBody = `Your verification code is ${verificationCode}. This code will expire in 5 minutes.`;


    if (!emailAddress) {
        return NextResponse.json("Email address is required",{status: 500});
    }

    await prismadb.verificationCode.create({
        data: {
            email: emailAddress,
            verificationCode,
            expiresAt,
            isUsed: false,
            createAt,
        }
    });


    try {
        await sendEmail(toAddress, fromAddress, subject, htmlBody, textBody);
        return NextResponse.json({ message: "Verification code sent" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }

}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const emailAddress  = searchParams.get("emailAddress");
        const verificationCodeCol = await prismadb.verificationCode.findFirst({
            where: { email: emailAddress || "" },
            orderBy: {
                createAt: "desc",
            },
        });
        if (verificationCodeCol) {
            return NextResponse.json(verificationCodeCol.verificationCode)
        } else {
            throw Error;
        }
    } catch(error) {
        return new NextResponse("[GET_CODE_ERROR]",{status:500});
        console.log(error)
    }
}

const generateVerificationCode = ():string => {
    return crypto.randomInt(100000, 999999).toString();
}