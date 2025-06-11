"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { useUserStore } from "@/stores/useUserStore";
import { message } from "antd";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setToken = useUserStore((state) => state.setToken);

  return (
    <div style={{ height: "100vh", backgroundColor: "#f5f5f5" }}>
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
            const userMenus = ["/", "/system", "/system/users"]; // 模拟后端返回的菜单权限
            setUserInfo({
              id: "1",
              username,
              avatar:
                "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
              roles: ["admin"],
              permissions: ["read", "write"],
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
  );
}
