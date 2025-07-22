"use client";

import { FC, useEffect, useState } from "react";
import {
  ModalForm,
  ProFormCascader,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
} from "@ant-design/pro-components";
import { Form, message, Upload } from "antd";
import { get, put } from "@/request";
import { findCascaderPath, getAssetsUrl, listToTree } from "@/utils/help";
import { Gender, mapGenderName } from "@/enums/genderEnum";
import { mapRelationName, Relationship } from "@/enums/relationEnum";
import { enum2SelectOptions } from "@/utils/enumUtils";
import { mapYesNoName, YesNo } from "@/enums/yesNoEnum";

interface EditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
}

const Edit: FC<EditProps> = ({ open, onOpenChange, onSuccess, editData }) => {
  const [form] = Form.useForm();
  const [regionTree, setRegionTree] = useState<any[]>([]);

  // 根据城市code查找完整的城市路径
  const findCityPath = (targetCode: string, tree: any[]): string[] | null => {
    const path: string[] = [];

    const find = (nodes: any[]): boolean => {
      for (const node of nodes) {
        path.push(node.code);
        if (node.code === targetCode) {
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (find(node.children)) {
            return true;
          }
        }
        path.pop();
      }
      return false;
    };

    find(tree);
    return path.length > 0 ? path : null;
  };

  // 获取地区列表
  const getRegionList = async () => {
    try {
      const res = await get("regionQuery/list");
      const tree = listToTree(res.data, {
        id: "code",
        children: "children",
        pid: "parentCode",
      });
      setRegionTree(tree);
      return tree;
    } catch (error) {
      console.error("获取地区列表失败:", error);
      return [];
    }
  };

  // 获取解密数据
  const getDecryptData = async () => {
    try {
      const res = await get("/butlerUserService/detail-decrypt", {
        butlerUserId: editData.id,
      });
      const formData = {
        ...editData,
        ...res.data,
        avatarImages: editData.avatar
          ? [
              {
                uid: "-1",
                name: "avatar.png",
                status: "done",
                url: editData.avatar,
              },
            ]
          : [],
        city: findCascaderPath(regionTree, editData.city),
      };

      form.setFieldsValue(formData);
    } catch (error) {
      console.error("获取解密数据失败:", error);
    }
  };

  // 只在弹窗打开且有编辑数据时初始化
  useEffect(() => {
    if (open && editData?.id) {
      getRegionList().then(() => {
        getDecryptData();
      });
    } else {
      form.resetFields();
    }
  }, [open, editData?.id]);

  const beforeUpload = (file: File) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("上传图片大小不能超过 1MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = async (values: any) => {
    const formData = { ...values, id: editData.id };
    const uploadRes = await getAssetsUrl(values.avatarImages);
    formData.avatar = uploadRes[0];
    const { result } = await put("/butlerUserService/update", formData);
    result === 0 && message.success("编辑成功");
    onSuccess?.();
    onOpenChange(false);
    return true;
  };

  return (
    <ModalForm
      title="编辑基本信息"
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        width: 600,
      }}
    >
      <ProFormText
        name="userName"
        label="姓名"
        rules={[{ required: true, message: "请输入姓名", max: 20 }]}
      />

      <ProFormSelect
        name="gender"
        label="性别"
        options={enum2SelectOptions(Gender, mapGenderName)}
        rules={[{ required: true, message: "请选择性别" }]}
      />

      <ProFormDatePicker name="birthday" label="出生日期" />

      <ProFormText
        name="idCard"
        label="身份证号"
        rules={[
          {
            pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            message: "请输入有效的身份证号",
          },
        ]}
        fieldProps={{
          maxLength: 18,
          onChange: (e) => {
            const value = e.target.value.replace(/[^0-9Xx]/g, "");
            form.setFieldValue("idCard", value.slice(0, 18));
          },
        }}
      />
      <ProFormGroup>
        <ProFormText
          name="phoneNumber"
          label="联系方式"
          width="sm"
          rules={[
            { required: true, message: "请输入电话" },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: "请输入有效的手机号码",
            },
          ]}
          fieldProps={{
            maxLength: 11,
            onChange: (e) => {
              form.setFieldValue(
                "phoneNumber",
                e.target.value.replace(/\D/g, "")
              );
            },
          }}
          addonWarpStyle={{ alignItems: "flex-start" }}
          addonBefore={
            <ProFormSelect
              name="phoneRelation"
              width="sm"
              options={enum2SelectOptions(Relationship, mapRelationName)}
              rules={[{ required: true, message: "请选择关系" }]}
            />
          }
        />
      </ProFormGroup>

      <ProFormCascader
        name="city"
        label="所属城市"
        request={async () => {
          return await getRegionList();
        }}
        fieldProps={{
          changeOnSelect: true,
          fieldNames: { label: "name", value: "code" },
          showSearch: true,
          displayRender: (labels) => labels[labels.length - 1],
          onChange: (_, selectedOptions) => {
            const lastOption = selectedOptions[selectedOptions.length - 1];
            form.setFieldValue("city", lastOption?.code);
          },
        }}
        transform={(value) => {
          if (Array.isArray(value)) {
            return value[value.length - 1];
          }
          return value;
        }}
      />

      <ProFormText
        name="address"
        label="详细地址"
        fieldProps={{ maxLength: 64 }}
      />

      <ProFormText
        name="street"
        label="所属街道"
        rules={[{ required: true, message: "请输入所属街道" }]}
        fieldProps={{ maxLength: 64 }}
      />

      <ProFormText
        name="committeePhone"
        label="居委电话"
        fieldProps={{
          maxLength: 32,
          onChange: (e) => {
            form.setFieldValue(
              "committeePhone",
              e.target.value.replace(/[^-\d]/g, "")
            );
          },
        }}
      />

      <ProFormSelect
        name="liveAlone"
        label="是否独居"
        options={enum2SelectOptions(YesNo, mapYesNoName)}
        rules={[{ required: true, message: "请选择是否独居" }]}
      />

      <ProFormUploadDragger
        name="avatarImages"
        label="头像"
        max={1}
        fieldProps={{
          name: "file",
          listType: "picture-card",
          beforeUpload: beforeUpload,
        }}
      />
    </ModalForm>
  );
};

export default Edit;
