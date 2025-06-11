import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 不需要验证权限的白名单路由
export const whiteList = ["/login", "/403", "/userInfo"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 检查是否为白名单路由
  if (whiteList.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. 获取 token，如果没有 token，重定向到登录页
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. 从 cookie 中获取用户菜单权限
  try {
    const menuPermissions = request.cookies.get("menu_permissions")?.value;
    if (!menuPermissions) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const permissions = JSON.parse(decodeURIComponent(menuPermissions));

    // 检查路由权限
    const hasPermission = permissions.some(
      (path: string) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!hasPermission) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  } catch {
    // 如果解析权限出错，重定向到登录页
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api 路由 (以 /api/ 开头)
     * - 静态文件 (以 .开头的文件)
     * - _next/static (Next.js 静态文件)
     * - _next/image (Next.js 图片优化 API)
     * - favicon.ico (浏览器自动请求的图标)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
