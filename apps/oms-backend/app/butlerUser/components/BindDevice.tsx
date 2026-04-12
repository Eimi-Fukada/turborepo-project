"use client";

import { get, post } from "@/request";
import { ModalForm, ProFormSelect } from "@ant-design/pro-components";
import { Form, message } from "antd";
import { useEffect, useState } from "react";

interface BindDeviceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  record: any;
  deviceType?: number;
  title?: string;
  snLabel?: string;
}

export default function BindDevice(props: BindDeviceProps) {
  const [form] = Form.useForm();
  const {
    open,
    onOpenChange,
    onSuccess,
    record,
    deviceType,
    title = "绑定设备",
    snLabel = "设备序列号",
  } = props;

  const [deviceList, setDeviceList] = useState<
    { label: string; value: string }[]
  >([]);

  // 获取可用设备列表
  const getDeviceList = async () => {
    const res = await get("/deviceService/list", {
      bound: 0,
      type: deviceType,
    });
    const list = res.data.map((item) => ({
      value: item.code,
      label: item.code,
    }));
    setDeviceList(list);
  };

  // 组件挂载或打开弹窗时获取设备列表
  useEffect(() => {
    if (open) {
      getDeviceList();
    }
  }, [open, deviceType]);

  const handleFinish = async (values) => {
    const { result } = await post("/butlerUserService/device-bind", {
      deviceSn: values.deviceSn,
      butlerUserId: record.id,
      deviceType: deviceType,
    });
    result === 0 && message.success("绑定成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title={title}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{ destroyOnClose: true }}
    >
      <ProFormSelect
        name="deviceSn"
        label={snLabel}
        options={deviceList}
        rules={[{ required: true, message: `请选择${snLabel}` }]}
        showSearch
        fieldProps={{
          loading: deviceList.length === 0,
          filterOption: (input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
        }}
      />
    </ModalForm>
  );
}
