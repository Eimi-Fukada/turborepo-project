import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuDataItem } from "@ant-design/pro-components";
import React from "react";

export const routes: MenuDataItem[] = [
  {
    path: "/",
    name: "首页",
    icon: <HomeOutlined />,
    btnPermissions: [
      {
        name: "新增",
        code: "/:add",
      },
    ],
  },
  {
    path: "/userInfo",
    name: "我的",
    icon: <UserOutlined />,
  },
];
