import {
  HomeOutlined,
  DatabaseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuDataItem } from "@ant-design/pro-components";
import React from "react";

export const routes: MenuDataItem[] = [
  {
    path: "/",
    name: "首页",
    icon: <HomeOutlined />,
  },
  {
    path: "/system",
    name: "系统管理",
    icon: <DatabaseOutlined />,
    children: [
      {
        path: "/system/users",
        name: "用户管理",
        icon: <UserOutlined />,
      },
    ],
  },
  {
    path: "/login",
    name: "登录",
    hideInMenu: true,
  },
];
