"use client";

import { post } from "@/request";
import { ModalForm, ProFormSelect } from "@ant-design/pro-components";
import { Form, message } from "antd";

interface BindAgentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  agentList: { label: string; value: string }[];
  record: any;
}

export default function BindAgent(props: BindAgentProps) {
  const [form] = Form.useForm();
  const { open, onOpenChange, onSuccess, agentList, record } = props;

  const handleFinish = async (values) => {
    const { result } = await post("/butlerUserService/agent-bind", {
      ...values,
      butlerUserId: record.id,
    });
    result === 0 && message.success("绑定成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title="绑定管家"
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{ destroyOnClose: true }}
    >
      <ProFormSelect
        name="agentId"
        label="选择管家"
        options={agentList}
        rules={[{ required: true, message: "请选择管家" }]}
        width={"md"}
      />
    </ModalForm>
  );
}
