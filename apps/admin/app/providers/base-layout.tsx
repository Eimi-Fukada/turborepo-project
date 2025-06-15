"use client";

import {
  PageContainer,
  ProBreadcrumb,
  ProLayout,
} from "@ant-design/pro-components";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useUserStore } from "@/stores/useUserStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { filterRoutesByPermissions } from "@/utils/route-utils";
import { Dropdown, MenuProps, Modal } from "antd";
import {
  ExclamationCircleFilled,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userInfo = useUserStore((state) => state.userInfo);
  const token = useUserStore((state) => state.token);
  const [clientRender, setClientRender] = useState(false);
  const router = useRouter();
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);

  useEffect(() => {
    // 确保在客户端渲染时才显示布局
    setClientRender(true);
  }, []);

  useEffect(() => {
    if (!token && pathname !== "/login") {
      console.log("⛔ 未登录或已退出，强制跳转到登录页");
      router.push("/login");
    }
  }, [pathname, token, router]);

  // 如果是登录页，不使用 ProLayout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 仅在客户端渲染时显示布局
  if (!clientRender) {
    return null;
  }

  // 根据用户权限过滤路由
  const filteredRoutes = userInfo?.menus
    ? filterRoutesByPermissions(routes, userInfo.menus)
    : routes;

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      Modal.confirm({
        title: "您确认退出登录吗?",
        icon: <ExclamationCircleFilled />,
        content: "退出后将无法访问系统，请重新登录。",
        okText: "确定",
        cancelText: "取消",
        onOk() {
          clearUserInfo();
          router.push("/login");
        },
      });
    } else if (key === "userInfo") {
      router.push("/userInfo");
    }
  };

  return (
    <ProLayout
      layout="mix"
      menuDataRender={() => filteredRoutes}
      location={{ pathname }}
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
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "userInfo",
                    icon: <UserOutlined />,
                    label: "个人中心",
                  },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "退出登录",
                  },
                ],
                onClick,
              }}
            >
              {dom}
            </Dropdown>
          );
        },
      }}
      fixedHeader
      fixSiderbar
      headerContentRender={() => {
        return <ProBreadcrumb />;
      }}
    >
      <PageContainer>{children}</PageContainer>
    </ProLayout>
  );
}
