import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "inventra-secret-key"
);

type TokenPayload = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("inventra_token")?.value;
  const user = token ? await verifyToken(token) : null;

  const isLoginPage = pathname === "/login";

  const isAdminOnlyPage =
    pathname === "/products/create" ||
    (pathname.startsWith("/products/") && pathname.endsWith("/edit"));

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && isAdminOnlyPage && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/products/:path*", "/reports/:path*", "/logs/:path*", "/login"],
};