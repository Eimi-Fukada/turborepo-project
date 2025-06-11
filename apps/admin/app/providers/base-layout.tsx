"use client";

import { ProLayout } from "@ant-design/pro-components";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useUserStore } from "@/stores/useUserStore";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userInfo = useUserStore((state) => state.userInfo);
  const [clientRender, setClientRender] = useState(false);

  useEffect(() => {
    // 确保在客户端渲染时才显示布局
    setClientRender(true);
  }, []);

  // 如果是登录页，不使用 ProLayout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 仅在客户端渲染时显示布局
  if (!clientRender) {
    return null;
  }

  return (
    <ProLayout
      layout="mix"
      menuDataRender={() => routes}
      location={{ pathname }}
      collapsed={false}
      logo="/bg-logo.webp"
      title=""
      menu={{
        type: "sub",
        defaultOpenAll: true,
      }}
      menuItemRender={(item, dom) => <Link href={item.path || "/"}>{dom}</Link>}
      avatarProps={{
        src: userInfo?.avatar ?? "/avatar.jpg",
        title: userInfo?.username ?? "Mir Admin",
        size: "small",
        render: (props, dom) => {
          return dom;
        },
      }}
      fixedHeader
      fixSiderbar
    >
      {children}
    </ProLayout>
  );
}
