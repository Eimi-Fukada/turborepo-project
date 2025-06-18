"use client";

import {
  MenuDataItem,
  PageContainer,
  ProLayout,
  ProLayoutProps,
} from "@ant-design/pro-components";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Dropdown, MenuProps } from "antd";
import {
  ExclamationCircleFilled,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import dayjs from "dayjs";

const weekDays = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

export interface BaseLayoutProps extends ProLayoutProps {
  children: React.ReactNode;
  menuData: MenuDataItem[];
  username?: string;
  avatar?: string;
  onLogout?: () => void;
}
export default function BaseLayout(props: BaseLayoutProps) {
  const pathname = usePathname();
  const [clientRender, setClientRender] = useState(false);
  const { modal } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    // 确保在客户端渲染时才显示布局
    setClientRender(true);
  }, []);

  // 仅在客户端渲染时显示布局
  if (!clientRender) {
    return null;
  }

  // 如果是登录页，不使用 ProLayout
  if (pathname === "/login") {
    return <>{props.children}</>;
  }

  const renderTime = () => {
    return dayjs().format("YYYY年MM月DD日");
  };

  const renderWeekend = () => {
    const weekend = weekDays[dayjs().day()];
    return weekend;
  };
  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      modal.confirm({
        title: "您确认退出登录吗?",
        icon: <ExclamationCircleFilled />,
        content: "退出后将无法访问系统，请重新登录。",
        okText: "确定",
        cancelText: "取消",
        onOk() {
          props.onLogout ? props?.onLogout() : router.push("/login");
        },
      });
    } else if (key === "userInfo") {
      router.push("/userInfo");
    }
  };

  return (
    <ProLayout
      layout="mix"
      menuDataRender={() => props.menuData}
      location={{ pathname }}
      logo="/bg-logo.webp"
      title=""
      menu={{
        type: "sub",
        defaultOpenAll: true,
        autoClose: false,
      }}
      menuItemRender={(item, dom) => <Link href={item.path || "/"}>{dom}</Link>}
      avatarProps={{
        src: props.avatar ?? "/avatar.jpg",
        title: props.username ?? "Mir Admin",
        size: "large",
        render: (_props, dom) => {
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
        return (
          <div className="text-black">
            {renderTime()} {renderWeekend()}
          </div>
        );
      }}
      // actionsRender={() => [<div className="text-black">xxx</div>]}
      {...props}
    >
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  );
}
