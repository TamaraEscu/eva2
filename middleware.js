import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretoJWT = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const esApi = pathname.startsWith("/api/");
  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (esApi) {
      return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secretoJWT);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(payload.id));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    if (esApi) {
      return NextResponse.json(
        { mensaje: "Token inválido o expirado" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/proyectos/:path*"],
};
