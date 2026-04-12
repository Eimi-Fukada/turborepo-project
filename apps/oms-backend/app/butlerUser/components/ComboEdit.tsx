"use client";

import { FC, useEffect } from "react";
import { ModalForm, ProFormSelect } from "@ant-design/pro-components";
import { Form, message } from "antd";
import { post } from "@/request";
import { Combo, mapComboDecr, mapComboName } from "@/enums/comboEnum";
import { enum2SelectOptions } from "@/utils/enumUtils";
import { modal } from "@/stores/globalInstanceStore";

interface EditDataType {
  id: number;
  combo?: Combo;
}

interface ComboEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: EditDataType;
}

const ComboEdit: FC<ComboEditProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editData?.combo) {
      // 设置套餐内容
      form.setFieldValue("comboContent", mapComboDecr(editData.combo));
    }
  }, [open, editData, form]);

  const handleFinish = async (values: any) => {
    const { result } = await post("/butlerUserService/combo-change", {
      ...values,
      butlerUserId: editData?.id,
    });
    result === 0 && message.success("套餐修改成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title="套餐选择"
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
      <ProFormSelect
        name="combo"
        label="选择套餐"
        options={enum2SelectOptions(Combo, mapComboName)}
        rules={[{ required: true, message: "请选择套餐" }]}
        fieldProps={{
          onChange: (value) => {
            form.setFieldValue("comboContent", mapComboDecr(value as Combo));
          },
        }}
      />
      <ProFormSelect
        name="comboContent"
        label="套餐内容"
        readonly
        options={[]}
      />
    </ModalForm>
  );
};

export default ComboEdit;
