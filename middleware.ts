import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/sign-in"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        return NextResponse.redirect(new URL("/explore", request.url));
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token && pathname === "/sign-in") {
        return NextResponse.redirect(new URL("/explore", request.url));
    }

    if (!token?.email && !publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/customAuth|api/auth|api/users|_next|public|icons).*)",
    ]
};