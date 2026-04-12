"use client";
import { asyncRouter } from "@/config/routes";
import { useCallBackState } from "@/hooks/useCallBackState";
import {
  syncHasSelect,
  syncHasSelectByMenuList,
  transformMenu,
} from "@/utils/routesHelp";
import {
  ActionType,
  ModalForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { App, Button, Form, Space, Tabs } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import AuthCheckCard from "../components/authCheckCard";
import { get, post } from "@/request";

const Component: FC = () => {
  const [state, setState] = useCallBackState<{
    activeKey: string;
    open: boolean;
    addOpen: boolean;
    tenantList: { value: number; label: string }[];
    omsAuthData: any[];
    tenantAuthData: any[];
    omsAsyncMenuData: any[];
    tenantAsyncMenuData: any[];
    tenantAllMenuData: any[];
  }>({
    activeKey: "0",
    open: false,
    addOpen: false,
    tenantList: [],
    omsAuthData: [],
    tenantAuthData: [],
    omsAsyncMenuData: [],
    tenantAsyncMenuData: transformMenu(asyncRouter),
    tenantAllMenuData: [],
  });
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  const tabItems = [
    {
      key: "0",
      label: "统一管理平台",
    },
    {
      key: "1",
      label: "租户管理平台",
    },
  ];

  const columns = [
    { title: "序号", dataIndex: "index", valueType: "indexBorder" },
    { title: "菜单名称", dataIndex: "name" },
    {
      title: "权限级别",
      dataIndex: "permissionType",
      renderText(text, record, index, action) {
        return <>{record.permissionType === 1 ? "菜单" : "按钮"}</>;
      },
    },
    { title: "菜单权限", dataIndex: "url" },
    {
      title: "同步状态",
      dataIndex: "hasSelect",
      valueEnum: {
        true: { text: "已同步", status: "Success" },
        false: { text: "未同步", status: "Error" },
      },
    },
  ];
  const actionColumn = [
    {
      title: "操作",
      key: "action",
      valueType: "option",
      render: (_, record) => (
        <Button
          color="danger"
          key="delete"
          variant="filled"
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>
      ),
    },
  ];

  const handleAuth = async () => {
    if (state.activeKey === "0") {
      const { data } = await get("/permission/getAllMenuSelected", {
        tenantId: 1,
      });
      setState({
        omsAsyncMenuData: syncHasSelect(transformMenu(asyncRouter), data),
      });
    }
    setState({
      open: true,
    });
    form.resetFields();
  };

  const getTenantList = async () => {
    const res = await post("tenantQuery/tenantOptionList", {
      startPage: 1,
      pageSize: 100,
      includeCurrentTenant: true,
    });
    const tenantList = res.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const getAuthMenuData = async () => {
    const res = await get("/permission/getAllMenuList", {
      systemId: state.activeKey === "0" ? 2 : 3,
    });
    const omsAsyncMenuData = syncHasSelect(
      transformMenu(asyncRouter),
      res.data
    );
    console.log("====", omsAsyncMenuData);
    if (state.activeKey === "1") {
      setState({
        tenantAllMenuData: res.data,
      });
    }
    return {
      data: state.activeKey === "0" ? omsAsyncMenuData : res.data,
      total: 0,
      success: true,
    };
  };

  // 同步
  const handleSync = async () => {
    const routes = transformMenu(asyncRouter).map((i) => {
      return {
        ...i,
        hasSelect: true,
        children: i.children?.map((j) => {
          return {
            ...j,
            hasSelect: true,
          };
        }),
      };
    });
    await post("/permission/savePermission", {
      systemId: 2,
      permissionList: routes,
    });
    message.success("同步成功");
    actionRef.current?.reload();
  };

  // 删除
  const handleDelete = async (record) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
      okText: "删除",
      cancelText: "取消",
      onOk: async () => {
        await post("/permission/deletePermission", {
          ids: [record.id],
        });
        message.success("删除成功");
        actionRef.current?.reload();
      },
    });
  };

  // 新增菜单
  const handleAddMenu = async (values) => {
    await post("/permission/createPermission", {
      systemId: 3,
      ...values,
    });
    setState({
      addOpen: false,
    });
    message.success("新增成功");
    actionRef.current?.reload();
  };

  // 租户选择
  const handleSelectTenant = async (value) => {
    const { data } = await get("/permission/getAllMenuSelected", {
      tenantId: value,
    });
    const tenantAsyncMenuData = syncHasSelectByMenuList(
      state.tenantAllMenuData,
      data
    );
    setState({
      tenantAsyncMenuData,
    });
  };
  // 授权
  const handleFinish = async (values) => {
    if (state.activeKey === "0") {
      await post("/permission/saveAdminPermission", {
        systemId: 2,
        tenantId: "1",
        menuPermissionList: state.omsAuthData,
      });
    } else {
      await post("/permission/saveAdminPermission", {
        systemId: 3,
        tenantId: values.tenantId,
        menuPermissionList: state.tenantAuthData,
      });
    }
    setState({
      open: false,
    });
    message.success("保存成功");
  };

  useEffect(() => {
    getTenantList();
  }, []);

  return (
    <>
      <Tabs
        activeKey={state.activeKey}
        onChange={(activeKey) => {
          setState({ activeKey });
          actionRef.current?.reload();
        }}
        type="card"
        items={tabItems}
      />
      <Space className="mb-4">
        {state.activeKey === "0" && (
          <Button type="primary" onClick={() => handleSync()}>
            同步
          </Button>
        )}
        {state.activeKey === "1" && (
          <Button
            type="primary"
            onClick={() => {
              setState({
                addOpen: true,
              });
              form1.resetFields();
            }}
          >
            新增
          </Button>
        )}
        <Button type="primary" onClick={() => handleAuth()}>
          授权
        </Button>
      </Space>
      <ProTable
        actionRef={actionRef}
        columns={
          state.activeKey === "0" ? columns : [...columns, ...actionColumn]
        }
        request={getAuthMenuData}
        rowKey="url"
        search={false}
        pagination={false}
        options={{
          setting: false,
        }}
      />
      <ModalForm
        title="授权权限"
        open={state.open}
        onOpenChange={(open) => setState({ open })}
        modalProps={{
          destroyOnHidden: true,
        }}
        form={form}
        onFinish={handleFinish}
      >
        {state.activeKey === "1" && (
          <ProFormSelect
            width="md"
            name="tenantId"
            label="渠道来源"
            options={state.tenantList}
            rules={[{ required: true, message: "请选择渠道来源" }]}
            onChange={(value) => handleSelectTenant(value)}
          />
        )}
        {state.activeKey === "1" ? (
          <ProFormDependency name={["tenantId"]}>
            {({ tenantId }) => {
              if (tenantId) {
                return (
                  <AuthCheckCard
                    data={state.tenantAsyncMenuData}
                    onChange={(allData) =>
                      setState({ tenantAuthData: allData })
                    }
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
        ) : (
          <AuthCheckCard
            data={state.omsAsyncMenuData}
            onChange={(allData) => setState({ omsAuthData: allData })}
          />
        )}
      </ModalForm>
      <ModalForm
        title="新增租户菜单"
        open={state.addOpen}
        onOpenChange={(open) => setState({ addOpen: open })}
        modalProps={{
          destroyOnHidden: true,
        }}
        form={form1}
        onFinish={handleAddMenu}
      >
        <ProFormText
          width="md"
          name="name"
          label="菜单名称"
          placeholder="请输入菜单名称"
          rules={[{ required: true, message: "请输入菜单名称" }]}
        />
        <ProFormText
          width="md"
          name="url"
          label="菜单路径"
          placeholder="请输入菜单路径"
          rules={[{ required: true, message: "请输入菜单路径" }]}
        />
        <ProFormText
          width="md"
          name="parentUrl"
          label="父级菜单"
          placeholder="请输入父级菜单"
        />
      </ModalForm>
    </>
  );
};

const AuthorizationMenu = memo(Component);
export default AuthorizationMenu;
