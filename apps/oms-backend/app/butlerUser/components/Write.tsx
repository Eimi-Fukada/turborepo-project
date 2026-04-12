"use client";

import { Combo, mapComboDecr, mapComboName } from "@/enums/comboEnum";
import { post } from "@/request";
import {
  EditableProTable,
  ModalForm,
  ProColumns,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDependency,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Card, Form, message } from "antd";
import { FC, useState } from "react";
import { Gender, mapGenderName } from "@/enums/genderEnum";
import { mapRelationName, Relationship } from "@/enums/relationEnum";
import { enum2SelectOptions, enum2ValueEnum } from "@/utils/enumUtils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  relation: Relationship;
}

interface WriteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  regionTree: any[];
  tenantList: { label: string; value: string }[];
  agentList: { label: string; value: string }[];
}

const Write: FC<WriteProps> = ({
  open,
  onOpenChange,
  onSuccess,
  regionTree,
  tenantList,
  agentList,
}) => {
  const [form] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<Contact[]>([]);

  const phoneRegex = /^1[3-9]\d{9}$/;
  const phoneValidator = (rule: any, value: string) => {
    if (!value) return Promise.reject("请输入手机号");
    if (!phoneRegex.test(value)) return Promise.reject("请输入正确的手机号");
    return Promise.resolve();
  };

  const columns: ProColumns<Contact>[] = [
    {
      title: "姓名",
      dataIndex: "name",
      formItemProps: {
        rules: [{ required: true, message: "请输入姓名" }],
      },
      width: "20%",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      formItemProps: {
        rules: [{ validator: phoneValidator, len: 11 }],
      },
      width: "20%",
    },
    {
      title: "性别",
      dataIndex: "gender",
      valueType: "select",
      valueEnum: enum2ValueEnum(Gender, mapGenderName),
      fieldProps: {
        options: enum2SelectOptions(Gender, mapGenderName),
      },
      formItemProps: {
        rules: [{ required: true, message: "请选择性别" }],
      },
      width: "15%",
    },
    {
      title: "关系",
      dataIndex: "relation",
      valueType: "select",
      valueEnum: enum2ValueEnum(Relationship, mapRelationName),
      fieldProps: {
        options: enum2SelectOptions(Relationship, mapRelationName),
      },
      formItemProps: {
        rules: [{ required: true, message: "请选择关系" }],
      },
      width: "15%",
    },
    {
      title: "操作",
      valueType: "option",
      width: "15%",
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditableKeys([...editableKeys, record.id]);
          }}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            const newDataSource = dataSource.filter(
              (item) => item.id !== record.id
            );
            setDataSource(newDataSource);
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  const handleFinish = async (values: any) => {
    const { result } = await post("/butlerUserService/save", {
      ...values,
      contacts: dataSource,
    });
    result === 0 && message.success("保存成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title="新建用户"
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={1000}
      layout="horizontal"
    >
      <Card title="基本信息" style={{ marginBottom: 24, width: "100%" }}>
        <ProFormGroup colProps={{ span: 8 }}>
          <ProFormText
            name="userName"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          />
          <ProFormSelect
            name="gender"
            label="性别"
            options={enum2SelectOptions(Gender, mapGenderName)}
            rules={[{ required: true, message: "请选择性别" }]}
          />
          <ProFormDatePicker
            name="birthday"
            label="出生日期"
            fieldProps={{
              format: "YYYY-MM-DD",
            }}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            name="phoneNumber"
            label="联系方式"
            width="sm"
            rules={[{ validator: phoneValidator }]}
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

        <ProFormGroup colProps={{ span: 8 }}>
          <ProFormCascader
            name="city"
            label="所属城市"
            fieldProps={{
              options: regionTree,
              fieldNames: { label: "name", value: "code" },
              showSearch: true,
              changeOnSelect: true,
              displayRender: (labels) => labels[labels.length - 1],
              onChange: (_, selectedOptions) => {
                const lastOption = selectedOptions[selectedOptions.length - 1];
                form.setFieldValue("city", lastOption?.code);
              },
            }}
            rules={[{ required: true, message: "请选择所属城市" }]}
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
            rules={[{ required: true, message: "请输入详细地址" }]}
          />
        </ProFormGroup>

        <ProFormGroup colProps={{ span: 8 }}>
          <ProFormText
            name="street"
            label="所属街道"
            rules={[{ required: true, message: "请输入所属街道" }]}
          />
          <ProFormText
            name="committeePhone"
            label="居委电话"
            rules={[{ required: true, message: "请输入居委电话" }]}
          />
          <ProFormSelect
            name="tenantId"
            label="所属租户"
            options={tenantList}
            rules={[{ required: true, message: "请选择租户" }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSelect
            name="combo"
            label="选购套餐"
            options={enum2SelectOptions(Combo, mapComboName)}
            rules={[{ required: true, message: "请选择套餐" }]}
            fieldProps={{
              onChange: (value: number) => {
                form.setFieldsValue({
                  comboContent: mapComboDecr(value as Combo),
                });
              },
            }}
          />
          <ProFormDependency name={["combo"]}>
            {({ combo }) =>
              combo ? (
                <ProFormText name="comboContent" label="套餐内容" disabled />
              ) : null
            }
          </ProFormDependency>
        </ProFormGroup>
      </Card>

      <Card title="紧急联系人" style={{ marginBottom: 24 }}>
        <EditableProTable<Contact>
          rowKey="id"
          maxLength={3}
          columns={columns}
          value={dataSource}
          onChange={setDataSource as (value: readonly Contact[]) => void}
          recordCreatorProps={{
            newRecordType: "dataSource",
            record: () => ({
              id: Date.now().toString(),
              name: "",
              phone: "",
              gender: Gender.MALE,
              relation: Relationship.SELF,
            }),
          }}
          editable={{
            type: "single",
            editableKeys,
            onChange: setEditableKeys,
            saveText: "保存",
            cancelText: "取消",
            actionRender: (row, config, dom) => [dom.save, dom.cancel],
          }}
        />
      </Card>
      <Card title="其他信息" style={{ width: "100%" }}>
        <ProFormGroup>
          <ProFormSelect name="agentId" label="指派管家" options={agentList} />
        </ProFormGroup>
      </Card>
    </ModalForm>
  );
};

export default Write;
