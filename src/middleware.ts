import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/auth";

// Các route công khai không cần xác thực
const PUBLIC_ROUTES = ["/", "/login", "/register", "/blog"];
// API routes công khai
const PUBLIC_API_ROUTES = ["/api/blogs"];
// Các route chỉ dành cho admin
const ADMIN_ROUTES = ["/admin", "/admin/users", "/admin/dashboard"];
// Các route chỉ dành cho người dùng thường (không phải admin)
const USER_ROUTES = ["/resumes", "/editor"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Kiểm tra nếu route là public thì không cần xác thực
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) ||
    PUBLIC_API_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Nếu không có token và không phải public route, chuyển hướng đến trang login
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Xác thực token
  const user = await verifyToken(token);

  // Nếu token không hợp lệ, chuyển hướng đến trang login
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Nếu là admin đang truy cập vào các route dành cho người dùng thường,
  // hoặc đang vào root ("/"), chuyển hướng đến trang dashboard
  if (
    user.role === "ADMIN" &&
    (pathname === "/" ||
      USER_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Kiểm tra quyền truy cập vào các route dành cho admin
  if (
    ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) &&
    user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api/auth|api/blogs|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes, except auth routes and public API routes
    "/(api(?!/auth|/blogs))(.*)",
  ],
};
