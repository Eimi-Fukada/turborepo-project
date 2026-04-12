"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { useUserStore } from "@/stores/useUserStore";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Bg from "../../public/bg.jpg";
import SliderCaptcha, { VerifyParam } from "rc-slider-captcha";
import { post } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { encrypt } from "@/utils/cryptojs";
import { FC, memo } from "react";

const Component: FC = () => {
  const [state, setState] = useCallBackState({
    open: false,
    backgroundImageWidth: 0,
    backgroundImageHeight: 0,
    templateImageWidth: 0,
    templateImageHeight: 0,
    id: "",
    username: "",
    password: "",
  });
  const router = useRouter();
  const setToken = useUserStore((state) => state.setToken);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setMenusPermissions = useUserStore(
    (state) => state.setMenusPermissions
  );
  const setMenuByUserData = useUserStore((state) => state.setMenuByUserData);

  const getSliderCaptcha = async () => {
    const res = await post(
      "/qRCodeService/qrCodeInfo",
      {},
      {},
      { silent: true }
    );
    setState({
      id: res.id,
      backgroundImageWidth: res.backgroundImageWidth,
      backgroundImageHeight: res.backgroundImageHeight,
      templateImageWidth: res.templateImageWidth,
      templateImageHeight: res.templateImageHeight,
    });
    return {
      bgUrl: res.backgroundImage,
      puzzleUrl: res.templateImage,
    };
  };

  const verifySliderCaptcha = async (data: VerifyParam) => {
    const res = await post("/qRCodeService/qrCodeVerify", {
      bgImageHeight: state.backgroundImageHeight,
      bgImageWidth: state.backgroundImageWidth,
      left: data.x,
      id: state.id,
      startTime: new Date().valueOf(),
      stopTime: new Date().valueOf(),
      templateImageHeight: state.templateImageHeight,
      templateImageWidth: state.templateImageWidth,
      top: 0,
      trackList: [
        {
          t: 0,
          type: "SLIDER",
          x: 0,
          y: 0,
        },
        {
          t: 0,
          type: "SLIDER",
          x: data.x,
          y: 0,
        },
      ],
    });
    if (res.result === 0) {
      signIn();
      return Promise.resolve();
    } else {
      Promise.reject();
    }
  };

  const signIn = async () => {
    const res = await post("/omsLoginService/login", {
      verifyKey: state.id,
      username: state.username,
      password: encrypt(state.password),
    });
    if (res.result === 0) {
      setToken(res.data.accessToken);
      document.cookie = `token=${res.data.accessToken}; path=/`;
      const [userInfo, userPermissions] = await Promise.all([
        post("/userService/userInfo"),
        post("/permission/getMenuByLoginUser"),
      ]);
      setUserInfo(userInfo.data);
      const menuData = userPermissions.data.map((i) => i.url);

      // 在开发环境下添加资源权限菜单
      const menuByUserData =
        process.env.NEXT_PUBLIC_APP_ENV === "development"
          ? [...menuData, ...["/resourcePermission"]]
          : menuData;
      setMenusPermissions(menuByUserData);
      setMenuByUserData(userPermissions.data);
      // 登录后，写入 cookie
      document.cookie = `permissions=${JSON.stringify(menuByUserData)}; path=/`;
      router.push(menuData[0] || "/userInfo");
    } else {
      setState({ open: false });
    }
  };

  const handleFinish = async (values: {
    username: string;
    password: string;
  }) => {
    const { username, password } = values;
    setState({
      open: true,
      username,
      password,
    });
  };

  return (
    <div style={{ height: "100vh" }}>
      <Image
        src={Bg}
        alt="Logo"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <Modal
        title="请完成下列验证后继续"
        footer={null}
        destroyOnHidden={true}
        open={state.open}
        onCancel={() => setState({ open: false })}
      >
        <SliderCaptcha
          bgSize={{
            width: state.backgroundImageWidth,
            height: state.backgroundImageHeight,
          }}
          puzzleSize={{
            width: state.templateImageWidth,
            height: state.templateImageHeight,
          }}
          request={getSliderCaptcha}
          onVerify={verifySliderCaptcha}
        />
      </Modal>
      <div className="absolute w-full h-full">
        <LoginFormPage
          logo="/logo.png"
          title="苏福·智护"
          subTitle="您的生活管家平台"
          onFinish={async (values: { username: string; password: string }) =>
            handleFinish(values)
          }
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: "large",
              prefix: <UserOutlined />,
              autoComplete: "username",
            }}
            placeholder="请输入用户名"
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
            placeholder="请输入用户密码"
            rules={[
              {
                required: true,
                message: "请输入用户密码！",
              },
            ]}
          />
        </LoginFormPage>
      </div>
    </div>
  );
};

const LoginPage = memo(Component);
export default LoginPage;
