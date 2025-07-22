"use client";

import { FC, useEffect } from "react";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Form, message } from "antd";
import { post, get } from "@/request";
import { Gender, mapGenderName } from "@/enums/genderEnum";
import { Relationship, mapRelationName } from "@/enums/relationEnum";
import { enum2SelectOptions } from "@/utils/enumUtils";

interface ContactsEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
  butlerUserId: string;
}

const ContactsEdit: FC<ContactsEditProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editData,
  butlerUserId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editData?.id) {
      getDecryptData();
    }
  }, [editData]);

  const getDecryptData = async () => {
    const res = await get(`/butlerUserService/contact-detail-decrypt`, {
      id: editData.id,
    });
    form.setFieldValue("phone", res.data.phone);
  };

  const handleFinish = async (values: any) => {
    const { result } = await post(
      editData?.id
        ? "/butlerUserService/editEmergencyContact"
        : "/butlerUserService/addEmergencyContact",
      {
      ...values,
      butlerUserId: butlerUserId,
    });
    result === 0 && message.success(editData?.id ? "编辑成功" : "新建成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title={editData?.id ? "编辑紧急联系人" : "新增紧急联系人"}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={400}
      initialValues={editData}
    >
      <ProFormText
        name="name"
        label="姓名"
        rules={[
          { required: true, message: "请输入姓名" },
          { max: 20, message: "姓名最多20个字符" },
        ]}
      />
      <ProFormSelect
        name="gender"
        label="性别"
        options={enum2SelectOptions(Gender, mapGenderName)}
        rules={[{ required: true, message: "请选择性别" }]}
      />
      <ProFormText
        name="phone"
        label="电话"
        rules={[
          { required: true, message: "请输入电话" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号",
          },
        ]}
        fieldProps={{
          maxLength: 11,
          onChange: (e) => {
            form.setFieldValue("phone", e.target.value.replace(/\D/g, ""));
          },
        }}
      />
      <ProFormSelect
        name="relation"
        label="关系"
        options={enum2SelectOptions(Relationship, mapRelationName)}
        rules={[{ required: true, message: "请选择关系" }]}
      />
    </ModalForm>
  );
};

export default ContactsEdit;
