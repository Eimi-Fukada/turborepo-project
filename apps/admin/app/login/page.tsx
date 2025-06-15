"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { useUserStore } from "@/stores/useUserStore";
import { message } from "antd";
import { useRouter } from "next/navigation";
import LoginWater from "./login-water";
import Image from "next/image";
import Bg from "../../public/bg.jpg";

export default function LoginPage() {
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setToken = useUserStore((state) => state.setToken);

  return (
    <div style={{ height: "100vh" }}>
      <Image
        src={Bg}
        alt="Logo"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0  w-full h-full">
        <LoginWater />
      </div>
      <div className="absolute w-full h-full">
        <LoginFormPage
          backgroundImageUrl="/login-bg.jpg"
          logo="/logo.png"
          title="苏康养"
          subTitle="您的生活管家平台"
          onFinish={async (values) => {
            // 这里添加实际的登录逻辑
            const { username } = values;
            try {
              // 模拟登录
              const userMenus = ["/", "/system", "/system/users"]; // 菜单权限
              const buttonPermissions = [
                "system:user:add",
                "system:user:edit",
                "system:user:delete",
                "system:user:view",
                "system:role:add",
                "system:role:edit",
              ]; // 按钮权限码

              setUserInfo({
                id: "1",
                username,
                roles: ["admin"],
                permissions: buttonPermissions,
                menus: userMenus,
              });

              setToken("mock-token");
              // 在 cookie 中存储 token 和菜单权限
              document.cookie = `token=mock-token; path=/`;
              document.cookie = `menu_permissions=${encodeURIComponent(
                JSON.stringify(userMenus)
              )}; path=/`;

              message.success("登录成功");
              router.push("/");
            } catch (error) {
              message.error(`登录失败${error}`);
            }
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: "large",
              prefix: <UserOutlined />,
            }}
            placeholder="用户名: admin"
            rules={[
              {
                required: true,
                message: "请输入用户名!",
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined />,
            }}
            placeholder="密码: ant.design"
            rules={[
              {
                required: true,
                message: "请输入密码！",
              },
            ]}
          />
        </LoginFormPage>
      </div>
    </div>
  );
}
