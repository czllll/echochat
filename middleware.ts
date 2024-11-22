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

    if (!publicRoutes.includes(pathname) && token?.email) {
        try {
            const verifyRes = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token.email}`
                }
            });

            if (!verifyRes.ok) {
                const response = NextResponse.redirect(new URL("/sign-in", request.url));
                response.cookies.delete("next-auth.session-token");
                response.cookies.delete("next-auth.callback-url");
                response.cookies.delete("next-auth.csrf-token");
                return response;
            }
        } catch (error) {
            return new NextResponse("AUTH_VERIFY_ERROR", {status: 500});
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/customAuth|api/auth|api/users|_next|icons|background.png|logo.png|favicon.ico|sitemap.xml).*)"
    ]
};