"use client";

import { FC, memo, useEffect, useState } from "react";
import { App, Button, Divider, Form, Image, Input, Modal, Tabs } from "antd";
import { post } from "@/request";
import { useRouter } from "next/navigation";
import { encrypt } from "@/utils/cryptojs";
import ImageCropper from "./components/ImageCropper";

interface UserInfo {
  id: string;
  username: string;
  mobile: string;
  realName: string;
  avatarUrl: string;
  roleMap: any;
}

const defaultAvatar = "/avatar.jpg";

const Component: FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [activeTab, setActiveTab] = useState("password");
  const [avatarDialogVisible, setAvatarDialogVisible] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string>();
  const { message } = App.useApp();

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const res = await post("userService/userInfo", {});
      if (res.result === 0) {
        setUserInfo(res.data);
      }
    } catch (error) {
      message.error("获取用户信息失败");
    }
  };

  // 修改密码
  const handleUpdatePassword = async (values: any) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        message.error("两次输入的密码不一致");
        return;
      }

      const res = await post("userService/updatePassword", {
        oldPasswd: encrypt(values.oldPassword),
        passwd: encrypt(values.newPassword),
      });

      if (res.result === 0) {
        message.success("修改成功，请重新登录");
        // 清除登录信息
        localStorage.removeItem("x-token");
        router.replace("/login");
      }
    } catch (error) {
      message.error("修改密码失败");
    }
  };

  // 修改头像
  const handleUpdateAvatar = async () => {
    if (!croppedImage) {
      message.error("请先选择并裁剪图片");
      return;
    }
    try {
      setAvatarLoading(true);
      // 将base64转换为文件对象
      const base64Data = croppedImage.split(",")[1] || "";
      const blob = atob(base64Data);
      const array = new Uint8Array(blob.length);
      for (let i = 0; i < blob.length; i++) {
        array[i] = blob.charCodeAt(i);
      }
      const file = new File([array], "avatar.png", { type: "image/png" });

      // 创建 FormData
      const formData = new FormData();
      formData.append("file", file);

      // 调用上传接口
      message.success("修改成功");
      setAvatarDialogVisible(false);
      setCroppedImage(undefined);
      // const res = await post("userService/uploadAvatar", formData);
      // if (res.result === 0) {
      //   await fetchUserInfo();
      //   message.success("修改成功");
      //   setAvatarDialogVisible(false);
      //   setCroppedImage(undefined);
      // }
    } catch (error) {
      message.error("修改头像失败");
    } finally {
      setAvatarLoading(false);
    }
  };

  // 组件加载时获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className="flex w-full h-full p-5">
      {/* 左侧个人信息 */}
      <div className="w-[400px] bg-white p-5 rounded-lg">
        <h2 className="text-lg font-bold mb-5">个人信息</h2>
        <div className="flex justify-center items-center mb-5">
          <div
            className="relative w-[150px] h-[150px] cursor-pointer hover:after:opacity-100"
            onClick={() => setAvatarDialogVisible(true)}
          >
            <Image
              className="rounded-full"
              width={150}
              height={150}
              src={userInfo?.avatarUrl || defaultAvatar}
              alt="avatar"
              preview={false}
            />
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-white bg-black/40 rounded-full opacity-0 transition-opacity">
              +
            </div>
          </div>
        </div>
        <Divider />
        <div className="flex justify-between items-center">
          <span>账号：</span>
          <span>{userInfo?.username}</span>
        </div>
        <Divider />
        <div className="flex justify-between items-center">
          <span>手机号码：</span>
          <span>{userInfo?.mobile || "-"}</span>
        </div>
        <Divider />
        <div className="flex justify-between items-center">
          <span>真实姓名：</span>
          <span>{userInfo?.realName || "-"}</span>
        </div>
        <Divider />
        <div className="flex justify-between items-center">
          <span>所属角色：</span>
          <div>
            {userInfo?.roleMap
              ? Object.values(userInfo.roleMap).join(",")
              : "-"}
          </div>
        </div>
      </div>

      {/* 右侧修改密码 */}
      <div className="flex-1 ml-5 bg-white p-5 rounded-lg">
        <h2 className="text-lg font-bold mb-5">基本资料</h2>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="修改密码" key="password">
            <Form form={form} layout="vertical" onFinish={handleUpdatePassword}>
              <Form.Item
                name="oldPassword"
                label="旧密码"
                rules={[{ required: true, message: "请输入旧密码" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[{ required: true, message: "请输入新密码" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                rules={[
                  { required: true, message: "请确认新密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  确认修改
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </div>

      {/* 修改头像弹窗 */}
      <Modal
        title="修改头像"
        open={avatarDialogVisible}
        onCancel={() => {
          setAvatarDialogVisible(false);
          setCroppedImage(undefined);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setAvatarDialogVisible(false);
              setCroppedImage(undefined);
            }}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={avatarLoading}
            onClick={handleUpdateAvatar}
          >
            确定
          </Button>,
        ]}
        width={800}
      >
        <ImageCropper
          imageUrl={userInfo?.avatarUrl || defaultAvatar}
          onCrop={setCroppedImage}
        />
      </Modal>
    </div>
  );
};

const UserInfoPage = memo(Component);
export default UserInfoPage;
