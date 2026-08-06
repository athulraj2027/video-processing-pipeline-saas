import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "./constants/constants";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get("token")?.value
    const isPublicRoute = publicRoutes.includes(pathname)
    if (!token && !isPublicRoute) return NextResponse.redirect(new URL("/signin", req.url))

    if (token && isPublicRoute) return NextResponse.redirect(new URL("/dashboard", req.url))

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};