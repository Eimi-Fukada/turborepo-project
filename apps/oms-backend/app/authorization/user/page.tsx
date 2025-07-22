"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { post } from "@/request";
import { encrypt } from "@/utils/cryptojs";
import { PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { App, Button, Form } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const canCreate = hasBtnPermission("/authorization/user:add");
  const canEdit = hasBtnPermission("/authorization/user:edit");
  const canDelete = hasBtnPermission("/authorization/user:del");
  const canResetPassword = hasBtnPermission(
    "/authorization/user:resetPassword"
  );

  const [state, setState] = useCallBackState({
    roleList: [] as { value: string; label: string }[],
    open: false,
    currentRecord: null as any,
  });
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "用户名",
      dataIndex: "realName",
      search: false,
    },
    {
      title: "手机号",
      dataIndex: "mobile",
      search: false,
    },
    {
      title: "登录账号",
      dataIndex: "username",
      search: false,
    },
    {
      title: "登录密码",
      dataIndex: "passwd",
      search: false,
      hideInTable: true,
    },
    {
      title: "角色",
      dataIndex: "roleId",
      valueType: "select",
      fieldProps: { options: state.roleList },
      renderText: (text, record, index, action) => {
        return <>{Object.values(record.roleMap).join(",")}</>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      fieldProps: {
        options: [
          { value: 0, label: "禁用" },
          { value: 1, label: "启用" },
        ],
      },
      valueEnum: {
        0: { text: "禁用", status: "Error" },
        1: { text: "启用", status: "Success" },
      },
      search: false,
    },
    {
      title: "创建人",
      dataIndex: "creatorName",
      search: false,
      hideInForm: true,
    },
    {
      title: "创建时间",
      dataIndex: "insertTime",
      search: false,
      hideInForm: true,
    },
  ];

  const getList = async (params) => {
    const res = await post("/userService/userInfoList", {
      ...params,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getRoleList = async () => {
    const res = await post("/permission/roleList", {
      pageSize: 100,
    });
    const roleList = res.items.map((item) => ({
      label: item.roleTitle,
      value: item.id,
    }));
    setState({
      roleList,
    });
  };

  const handleEdit = async (records) => {
    setState({
      open: true,
      currentRecord: records,
    });
    form.setFieldsValue({
      ...records,
      roleIdList: Object.keys(records.roleMap),
    });
  };
  const handleDelete = async (records) => {
    await post("/userService/delUserInfo", [records.userId]);
    message.success("删除成功");
    actionRef.current?.reload();
  };

  const handleResetPassword = async (records) => {
    modal.confirm({
      title: "重置密码",
      content: "确定要重置密码吗？",
      onOk: async () => {
        const { result, data } = await post("/userService/resetPassword", {
          userId: records.userId,
        });
        if (result === 0) {
          message.success("重置密码成功");
          modal.info({
            title: "重置密码成功",
            content: `新密码: ${data}`,
            okText: "复制新密码",
            onOk: () => {
              navigator.clipboard.writeText(data);
              message.success("复制成功");
            },
          });
        }
      },
    });
  };

  const handleFinish = async (values) => {
    if (state.currentRecord) {
      await post("/userService/updateUser", {
        ...values,
        userId: state.currentRecord.userId,
      });
    } else {
      await post("/userService/saveUserInfo", {
        ...values,
        passwd: encrypt(values.passwd),
      });
    }
    setState({
      open: false,
    });
    message.success("操作成功");
    actionRef.current?.reload();
  };

  useEffect(() => {
    getRoleList();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getList}
        expandToolBarRender={(_, searchParams) => [
          canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setState({
                  open: true,
                  currentRecord: null,
                });
                form.resetFields();
              }}
            >
              新增
            </Button>
          ),
        ]}
        expandActionRender={(record) => [
          canEdit && (
            <Button
              color="primary"
              variant="filled"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          ),
          canResetPassword && (
            <Button
              color={"danger"}
              variant="filled"
              onClick={() => handleResetPassword(record)}
            >
              重置密码
            </Button>
          ),
        ]}
        onDelete={(record) => handleDelete(record)}
        expandButtonProps={(record) => ({
          hideDeleteButton: !canDelete,
          hideEditButton: !canEdit,
          hideDetailAction: true,
        })}
      />
      <ModalForm
        title={state.currentRecord ? "编辑" : "新增"}
        open={state.open}
        onOpenChange={(open) => setState({ open })}
        modalProps={{
          destroyOnHidden: true,
        }}
        form={form}
        onFinish={handleFinish}
        colProps={{ span: 12 }}
        grid
        rowProps={{ gutter: [16, 0] }}
      >
        <ProFormText
          width="md"
          name="realName"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        />
        <ProFormText
          width="md"
          name="mobile"
          label="手机号"
          placeholder="请输入手机号"
          formItemProps={{
            rules: [{ max: 11 }],
          }}
        />
        <ProFormText
          width="md"
          name="username"
          label="登录账号"
          placeholder="请输入登录账号"
          rules={[{ required: true, message: "请输入登录账号" }]}
        />
        {!state.currentRecord && (
          <ProFormText
            width="md"
            name="password"
            label="登录密码"
            placeholder="请输入登录密码"
            rules={[{ required: true, message: "请输入登录密码" }]}
          />
        )}
        <ProFormSelect
          width={"md"}
          name="status"
          label="状态"
          options={[
            {
              label: "启用",
              value: 1,
            },
            {
              label: "禁用",
              value: 0,
            },
          ]}
          placeholder="请选择状态"
          rules={[{ required: true, message: "请选择状态" }]}
        />
        <ProFormSelect
          width={"md"}
          name="roleIdList"
          label="角色"
          mode="multiple"
          options={state.roleList}
          placeholder="请选择角色"
          rules={[{ required: true, message: "请选择角色" }]}
        />
      </ModalForm>
    </>
  );
};

const AuthorizationUser = memo(Component);
export default AuthorizationUser;
