import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
    // const token = request.cookies.get("token")?.value;
    // const pathname = request.nextUrl.pathname;

    // // Check if user is trying to access protected routes
    // const isProtectedRoute = pathname.startsWith("/dashboard");
    // const isAuthRoute = pathname.startsWith("/signin") || pathname.startsWith("/signup");

    // if (isProtectedRoute && !token) {
    //     return NextResponse.redirect(new URL("/signin", request.url));
    // }

    // if ((pathname === "/" || pathname === "/signup") && token) {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    return NextResponse.next();
}