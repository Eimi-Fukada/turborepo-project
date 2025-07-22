import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const whiteList = ["/403", "/login", "/not-found"];
  if (whiteList.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // 获取 token，如果没有 token，重定向到登录页
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cookiePermissions = request.cookies.get("permissions")?.value;
  const permissionsList: string[] = cookiePermissions
    ? JSON.parse(cookiePermissions)
    : [];
  const fullPermissions = [...permissionsList, "/userInfo"];

  // 检查是否为有权限的路由
  if (!fullPermissions.includes(pathname)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
