import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// 无需登录即可访问的路径
const publicRoutes = ["/sign-in"];
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // 处理根路径
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 已登录用户访问登录页面时重定向到dashboard
    if (token && pathname === "/sign-in") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 未登录用户访问需要认证的路径时重定向到登录页
    if (!token && !publicRoutes.includes(pathname)) {
        const redirectUrl = new URL("/sign-in", request.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * 匹配所有路径除了:
         * /api/auth/* (auth 接口)
         * /_next/* (Next.js 静态文件)
         * /images/* (静态资源)
         * /favicon.ico, /sitemap.xml (静态文件)
         */
        "/((?!api/customAuth|api/auth|api/users|_next|images|favicon.ico|sitemap.xml).*)"
    ]
};