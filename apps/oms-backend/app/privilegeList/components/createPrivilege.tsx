"use client";

import { Button, Form, Input, Modal, Select } from "antd";
import { FC, useState, useEffect } from "react";
import { get, post } from "@/request";

interface CreatePrivilegeCardModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  tenantList: { value: string; label: string }[];
}

const CreatePrivilegeCardModal: FC<CreatePrivilegeCardModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  tenantList,
}) => {
  const [form] = Form.useForm();
  const [cardTemplates, setCardTemplates] = useState<
    { value: string; label: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const getCardTemplatesOptions = async () => {
    const res = await post("/privilegeCard/tenantPrivilegeCardList", {
      tenantId: 0,
    });
    if (res.result === 0) {
      setCardTemplates(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      // 构造提交数据
      const submitData = {
        tenantId: values.tenantId,
        cardId: values.cardId,
        name: values.name,
        count: values.count,
      };
      // 调用保存接口
      const res = await post("/privilegeCard/genCard", submitData);

      onSubmit(values); // 调用父组件回调
      onCancel(); // 关闭模态框
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputFilterNumber = (value) => {
    // 使用正则表达式过滤掉非数字字符
    form.setFieldsValue({
      count: value.replace(/\D/g, ""),
    });
  };

  useEffect(() => {
    form.resetFields();
    getCardTemplatesOptions();
  }, [visible]);

  return (
    <Modal
      title="生成权益卡"
      open={visible}
      width={400}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          关闭
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={() => form.submit()}
        >
          保存
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          count: 1,
        }}
      >
        <Form.Item
          style={{ marginTop: 20 }}
          name="tenantId"
          label="渠道来源"
          rules={[{ required: true, message: "请选择渠道来源" }]}
        >
          <Select options={tenantList} placeholder="请选择渠道来源" />
        </Form.Item>

        <Form.Item
          name="cardId"
          label="卡模板"
          rules={[{ required: true, message: "请选择卡模板" }]}
        >
          <Select options={cardTemplates} placeholder="请选择卡模板" />
        </Form.Item>

        <Form.Item
          name="name"
          label="权益卡名称"
          rules={[{ required: true, message: "请输入权益卡名称" }]}
        >
          <Input placeholder="请输入权益卡名称" />
        </Form.Item>

        <Form.Item
          name="count"
          label="卡密数量"
          rules={[{ required: true, message: "请输入卡密数量" }]}
        >
          <Input
            value={1}
            maxLength={5}
            onChange={(e) => handleInputFilterNumber(e.target.value)}
            placeholder="请输入卡密数量"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePrivilegeCardModal;
