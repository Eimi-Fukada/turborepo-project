"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { post } from "@/request";
import { ActionType, ModalForm, ProFormText } from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { FC, memo, useRef } from "react";
import { App, Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AuthCheckCard from "../components/authCheckCard";
import { transformMenu } from "@/utils/routesHelp";
import { asyncRouter } from "@/config/routes";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const canCreate = hasBtnPermission("/authorization/role:add");
  const canEdit = hasBtnPermission("/authorization/role:edit");
  const canDelete = hasBtnPermission("/authorization/role:del");
  const canShowDetail = hasBtnPermission("authorization:role:viewDetail");
  const canEnable = hasBtnPermission("/authorization/role:enableDisable");

  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState({
    open: false,
    currentRecord: null as any,
    authData: [] as any[],
    menuData: transformMenu(asyncRouter),
    disabled: false,
  });
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "角色编码",
      dataIndex: "name",
    },
    {
      title: "角色名称",
      dataIndex: "roleTitle",
    },
    {
      title: "角色描述",
      dataIndex: "roleDesc",
      search: false,
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
    },
    {
      title: "创建时间",
      dataIndex: "insertTime",
      search: false,
    },
  ];

  const getList = async (params) => {
    const res = await post("/permission/roleList", {
      ...params,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const handleChangeStatus = async (record) => {
    await post("/permission/enableOrDisableRole", {
      roleId: record.id,
      status: record.status === 1 ? 0 : 1,
    });
    actionRef.current?.reload();
  };

  function syncHasSelect(menuList, dataList) {
    return menuList.map((menu) => {
      // 在 dataList 里找到同 url 的节点
      const match = dataList.find((d) => d.url === menu.url);

      // 处理 children
      let children = undefined;
      if (menu.children) {
        // 如果 dataList 里有对应的 children，则递归同步
        const matchChildren = match?.children || [];
        children = syncHasSelect(menu.children, matchChildren);
      }

      return {
        ...menu,
        hasSelect: !!match,
        children,
      };
    });
  }
  const handleEdit = async (record) => {
    const { data } = await post("/permission/getPermissionByRoleId", record.id);
    setState({
      open: true,
      disabled: false,
      currentRecord: record,
      menuData: syncHasSelect(transformMenu(asyncRouter), data),
    });
    form.setFieldsValue({
      roleTitle: record.roleTitle,
      roleDesc: record.roleDesc,
    });
  };

  const handleDetail = async (record) => {
    await handleEdit(record);
    setState({
      disabled: true,
    });
  };
  const handleDelete = async (record) => {
    const { result } = await post("/permission/deleteRolePermission", {
      ids: [record.id],
    });
    result === 0 && message.success("删除成功");
    actionRef.current?.reload();
  };

  const handleFinish = async (values) => {
    const { result, resultMessage } = await post(
      "/permission/saveRolePermission",
      {
        roleId: state.currentRecord ? state.currentRecord?.id : 0,
        roleDesc: values.roleDesc,
        roleTitle: values.roleTitle,
        menuPermissionList: state.authData,
      }
    );
    if (result === 0) {
      message.success("保存成功");
      setState({
        open: false,
      });
      actionRef.current?.reload();
    } else {
      message.error(resultMessage);
    }
  };

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
                  disabled: false,
                  currentRecord: null,
                  authData: [],
                  menuData: transformMenu(asyncRouter),
                });
                form.resetFields();
              }}
            >
              新增
            </Button>
          ),
        ]}
        expandActionRender={(record) => [
          canEnable && record.adminRole === 0 && (
            <Button
              color={record.status === 1 ? "danger" : "cyan"}
              variant="filled"
              onClick={() => handleChangeStatus(record)}
            >
              {record.status === 1 ? "禁用" : "启用"}
            </Button>
          ),
          canShowDetail && (
            <Button
              color="primary"
              variant="filled"
              onClick={() => handleDetail(record)}
            >
              详情
            </Button>
          ),
          canEdit && record.adminRole !== 1 && (
            <Button
              color="primary"
              variant="filled"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          ),
        ]}
        onDelete={(record) => handleDelete(record)}
        expandButtonProps={(record) => ({
          hideDeleteButton: !canDelete,
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
        submitter={state.disabled ? false : undefined}
      >
        <ProFormText
          width="md"
          name="roleTitle"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: "请输入角色名称" }]}
          disabled={state.disabled}
        />
        <ProFormText
          width="md"
          name="roleDesc"
          label="角色描述"
          placeholder="请输入角色描述"
          disabled={state.disabled}
        />
        <AuthCheckCard
          data={state.menuData}
          onChange={(allData) => setState({ authData: allData })}
          disabled={state.disabled}
        />
      </ModalForm>
    </>
  );
};

const AuthorizationRole = memo(Component);
export default AuthorizationRole;
