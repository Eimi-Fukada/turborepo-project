"use client";

import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post, put } from "@/request";
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
import { FC, memo, useEffect, useRef, useState } from "react";
import { asyncRouter } from "@/config/routes";

interface ResourcePermissionItem {
  id: string;
  systemId: string;
  requestMethod: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  permissionCode: string | string[];
}
// 递归获取所有菜单路径和按钮权限
const getAllPermissions = (routes: any[]) => {
  let permissions: { name: string; url: string }[] = [];

  const traverse = (items: any[]) => {
    items.forEach((item) => {
      if (item.path) {
        permissions.push({
          name: item.name,
          url: item.path,
        });
      }

      // 添加按钮权限
      if (item.btnPermissions) {
        permissions = permissions.concat(
          item.btnPermissions.map((btn: any) => ({
            name: item.name + ":" + btn.name,
            url: btn.code,
          }))
        );
      }

      // 递归处理子菜单
      if (item.children) {
        traverse(item.children);
      }
    });
  };

  traverse(routes);
  return permissions;
};

const Component: FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [allData, setAllData] = useState<ResourcePermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useCallBackState<{
    open: boolean;
    currentRow: ResourcePermissionItem | null;
    btnPermissions: { name: string; url: string }[];
  }>({
    open: false,
    currentRow: null,
    btnPermissions: getAllPermissions(asyncRouter),
  });

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "系统ID",
      dataIndex: "systemId",
    },
    {
      title: "请求方式",
      dataIndex: "requestMethod",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ],
      },
    },
    {
      title: "资源URL",
      dataIndex: "url",
      fieldProps: {
        allowClear: true,
      },
    },
    {
      title: "权限Code",
      dataIndex: "permissionCode",
      valueType: "select",
      fieldProps: {
        mode: "multiple",
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return (
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase()) ||
            (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
          );
        },
        options: state.btnPermissions.map((item) => ({
          label: `${item.name}`,
          value: item.url,
        })),
      },
      render: (_, record) => {
        const codes = Array.isArray(record.permissionCode)
          ? record.permissionCode
          : record.permissionCode?.split(",") || [];
        return codes
          .map((code) => {
            const permission = state.btnPermissions.find((p) => p.url === code);
            return permission ? `${permission.name}` : code;
          })
          .join(", ");
      },
    },
    {
      title: "是否有权限Code",
      dataIndex: "hasCode",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "", label: "全部" },
          { value: 1, label: "有" },
          { value: 2, label: "无" },
        ],
      },
      hidden: true,
      render: (_, record) => {
        return record.permissionCode ? "有" : "无";
      },
    },
  ];

  // 获取所有数据
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await get("resourcePermissionService/list");
      if (res.result === 0) {
        setAllData(res.data || []);
        // 强制表格重新加载数据
        actionRef.current?.reload();
      } else {
        message.error("获取数据失败");
      }
    } catch (error) {
      message.error("获取数据失败");
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAllData();
  }, []);

  // 前端筛选数据
  const getList = async (params: any) => {
    const {
      startPage,
      pageSize,
      systemId,
      requestMethod,
      url,
      permissionCode,
      hasCode,
    } = params;

    // 确保基础数据的唯一性
    let filteredData = [
      ...new Map(allData.map((item) => [item.id, item])).values(),
    ];

    // 筛选系统ID
    if (systemId) {
      filteredData = filteredData.filter((item) =>
        item.systemId?.toLowerCase().includes(systemId.toLowerCase())
      );
    }

    // 筛选请求方式
    if (requestMethod) {
      filteredData = filteredData.filter(
        (item) => item.requestMethod === requestMethod
      );
    }

    // 筛选资源URL
    if (url) {
      filteredData = filteredData.filter((item) =>
        item.url?.toLowerCase().includes(url.toLowerCase())
      );
    }

    // 筛选权限Code
    if (permissionCode) {
      const codes = Array.isArray(permissionCode)
        ? permissionCode
        : [permissionCode];
      filteredData = filteredData.filter((item) => {
        const itemCodes = item.permissionCode
          ? typeof item.permissionCode === "string"
            ? item.permissionCode.split(",").filter(Boolean)
            : item.permissionCode
          : [];
        return codes.every((code) => itemCodes.includes(code));
      });
    }

    // 筛选是否有权限Code
    if (hasCode) {
      filteredData = filteredData.filter((item) => {
        const hasPermissionCode =
          item.permissionCode &&
          (Array.isArray(item.permissionCode)
            ? item.permissionCode.length > 0
            : item.permissionCode.split(",").filter(Boolean).length > 0);
        return hasCode === 1 ? hasPermissionCode : !hasPermissionCode;
      });
    }

    // 确保最终结果的唯一性
    filteredData = [
      ...new Map(filteredData.map((item) => [item.id, item])).values(),
    ];

    const total = filteredData.length;
    const startIndex = (startPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredData.slice(startIndex, endIndex);

    return {
      data: pageData,
      success: true,
      total,
      pageSize,
      startPage,
    };
  };

  const handleEdit = async (record: ResourcePermissionItem) => {
    const currentRecord = {
      ...record,
      permissionCode: Array.isArray(record.permissionCode)
        ? record.permissionCode
        : record.permissionCode?.split(",") || [],
    };

    // 先重置表单
    form.setFieldsValue(currentRecord);

    setState({
      ...state,
      open: true,
      currentRow: currentRecord,
    });
  };

  const handleFinish = async (values: ResourcePermissionItem) => {
    try {
      const permissionCode = Array.isArray(values.permissionCode)
        ? values.permissionCode.join(",")
        : values.permissionCode || "";

      if (state.currentRow?.id) {
        await put("/resourcePermissionService", {
          ...values,
          id: state.currentRow.id,
          permissionCode,
        });
      } else {
        await post("/resourcePermissionService", {
          ...values,
          permissionCode,
        });
      }
      message.success("操作成功");
      setState({ open: false });
      // 重新获取所有数据
      await fetchAllData();
      actionRef.current?.reload();
    } catch (error) {
      message.error("操作失败");
    }
  };

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getList}
        headerTitle="资源权限列表"
        loading={loading}
        search={{
          filterType: "light",
          defaultCollapsed: false,
        }}
        expandActionRender={(record) => [
          <Button
            color="primary"
            variant="filled"
            onClick={() => handleEdit(record)}
            key="edit"
          >
            编辑
          </Button>,
        ]}
      />
      <ModalForm
        title={state.currentRow ? "编辑" : "新增"}
        open={state.open}
        form={form}
        modalProps={{
          destroyOnHidden: true,
          afterClose: () => {
            form.resetFields();
          },
        }}
        onOpenChange={(open) => {
          if (!open) {
            form.resetFields();
          }
          setState({ ...state, open });
        }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="systemId"
          label="系统ID"
          placeholder="请输入系统ID"
          disabled
          rules={[{ required: true, message: "请输入系统ID" }]}
        />
        <ProFormSelect
          name="requestMethod"
          label="请求方式"
          disabled
          options={[
            { value: "GET", label: "GET" },
            { value: "POST", label: "POST" },
            { value: "PUT", label: "PUT" },
            { value: "DELETE", label: "DELETE" },
          ]}
          placeholder="请选择请求方式"
          rules={[{ required: true, message: "请选择请求方式" }]}
        />
        <ProFormText
          name="url"
          label="资源URL"
          placeholder="请输入资源URL"
          disabled
          rules={[{ required: true, message: "请输入资源URL" }]}
        />
        <ProFormSelect
          name="permissionCode"
          label="权限Code"
          mode="multiple"
          showSearch
          options={state.btnPermissions.map((item) => ({
            label: `${item.name}:${item.url}`,
            value: item.url,
          }))}
          placeholder="请选择权限Code"
        />
      </ModalForm>
    </>
  );
};

const ResourcePermissionList = memo(Component);
export default ResourcePermissionList;
