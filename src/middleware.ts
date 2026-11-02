import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";

const SESSION_COOKIE_NAME = "descomplica_session";

function roleHome(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PROFESSOR") return "/professor";
  return "/app";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthRoute = pathname === "/entrar" || pathname === "/cadastro";
  const isAdminRoute = pathname.startsWith("/admin");
  const isProfessorRoute = pathname.startsWith("/professor");
  const isAppRoute = pathname.startsWith("/app");

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  if ((isAdminRoute || isProfessorRoute || isAppRoute) && !session) {
    const loginUrl = new URL("/entrar", request.url);
    loginUrl.searchParams.set("redirecionar", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  if (isProfessorRoute && session && session.role !== "PROFESSOR" && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/professor/:path*", "/admin/:path*", "/entrar", "/cadastro"],
};
