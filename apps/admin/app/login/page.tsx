"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { useUserStore } from "@/stores/useUserStore";
import { App } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Bg from "../../public/bg.jpg";

export default function LoginPage() {
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setToken = useUserStore((state) => state.setToken);
  const { message } = App.useApp();

  return (
    <div style={{ height: "100vh" }}>
      <Image
        src={Bg}
        alt="Logo"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute w-full h-full">
        <LoginFormPage
          logo="/logo.png"
          title="Turborepo"
          subTitle="Turborepo 管理的项目集"
          onFinish={async (values) => {
            const { username, password } = values;
            try {
              // 调用登录API
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
              });

              const result = await response.json();

              if (result.success) {
                const { user, token } = result.data;
                
                // 更新用户状态
                setUserInfo({
                  id: user.id,
                  username: user.username,
                  roles: user.roles,
                  permissions: user.permissions,
                  menus: user.menus,
                  email: user.email,
                });

                setToken(token);
                
                // 在 cookie 中存储 token 和菜单权限
                document.cookie = `token=${token}; path=/`;
                document.cookie = `menu_permissions=${encodeURIComponent(
                  JSON.stringify(user.menus)
                )}; path=/`;

                message.success("登录成功");
                router.push("/");
              } else {
                message.error(result.message || "登录失败");
              }
            } catch (error) {
              console.error("登录失败:", error);
              message.error("登录请求失败，请检查网络连接");
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
