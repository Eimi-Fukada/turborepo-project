"use client";

import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { get, post, put, del } from "@/request";
import { PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, App, Form } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import { hasBtnPermission } from "@/utils/permission";
const Component: FC = () => {
  const canAdd = hasBtnPermission("/contactManagement/contactManagement:save");
  const canEnable = hasBtnPermission(
    "/contactManagement/contactManagement:enanble"
  );
  const canEdit = hasBtnPermission("/contactManagement/contactManagement:edit");
  const canDelete = hasBtnPermission(
    "/contactManagement/contactManagement:del"
  );
  const canShowDetail = hasBtnPermission(
    "/contactManagement/contactManagement:detail"
  );

  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState({
    open: false,
    title: "",
    currentRecord: {} as any,
    customList: [] as { label: string; value: string }[],
    tenantList: [] as { label: string; value: string }[],
    agentList: [] as { label: string; value: string }[],
    butlerContactList: [] as { label: string; value: string }[],
  });
  const [form] = Form.useForm();

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "联系人",
      dataIndex: "contactName",
    },
    {
      title: "联系号码",
      dataIndex: "contactNumber",
      search: false,
    },
    {
      title: "管家坐席",
      dataIndex: "agentWorkerList",
      search: false,
      renderText(text, record, index, action) {
        return (
          <div>
            {record?.agentWorkerList && record.agentWorkerList.length > 0 ? (
              <>
                指定管家：
                {record.agentWorkerList.map((worker) => worker.name).join(", ")}
              </>
            ) : (
              "全部管家"
            )}
          </div>
        );
      },
    },
    {
      title: "关联用户",
      dataIndex: "relatedUserList",
      search: false,
      renderText(text, record, index, action) {
        return (
          <>
            {getRelatedUserList(
              record.relatedType,
              record?.relatedUserList || []
            )}
          </>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "1", label: "正常" },
          { value: "2", label: "停用" },
        ],
      },
      valueEnum: {
        "1": { text: "正常", status: "Success" },
        "2": { text: "停用", status: "Error" },
      },
    },
    {
      title: "号码类型",
      dataIndex: "contactType",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "1", label: "手机号" },
          { value: "2", label: "固话" },
          { value: "3", label: "坐席管家" },
        ],
      },
    },
    {
      title: "创建时间",
      dataIndex: "inserttime",
      search: false,
      hideInForm: true,
    },
  ];

  const getContactManagement = async (params) => {
    const res = await get("/butlerContactService/page", { ...params });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getRelatedUserList = (
    type: number,
    userList: { relatedId: string; relatedName: string }[]
  ) => {
    if (type === 1) {
      return "全部";
    } else if (type === 2) {
      return "指定用户" + userList.map((i) => i.relatedName).join(",");
    } else {
      return "指定租户" + userList.map((i) => i.relatedName).join(",");
    }
  };

  const getAllList = async () => {
    const [customList, tenantList, butlerContactList] = await Promise.all([
      get("/butlerUserService/page", { startPage: 1, pageSize: 999 }),
      post("tenantQuery/tenantOptionList", {
        startPage: 1,
        pageSize: 100,
        includeCurrentTenant: true,
      }),
      //get("/agentInfoService/list"),
      post("/butlerWorkerService/page", { startPage: 1, pageSize: 999 }),
    ]);
    state.customList = customList.items?.map((i) => {
      return { label: i.userName, value: i.id };
    });
    state.tenantList = tenantList.items?.map((i) => {
      return { label: i.name, value: i.id };
    });
    // state.agentList = agentList.data?.map((i) => {
    //   return { label: i.name, value: i.phoneNumber };
    // });
    state.butlerContactList = butlerContactList.items?.map((i) => {
      return { label: i.realName, value: i.userId };
    });
  };

  // 从接口筛选用户数据
  const remoteMethod = async (query: string) => {
    const res = await get("/butlerUserService/page", {
      startPage: 1,
      pageSize: 999,
      userName: query,
    });
    const customList = res.items?.map((i) => {
      return { label: i.userName, value: i.id };
    });
    return customList;
  };

  const handleChangeStatus = async (record) => {
    if (record.status === 1) {
      const { result } = await post(
        "/butlerContactService/disable",
        {},
        {
          id: record.id,
        }
      );
      if (result === 0) {
        message.success("已停用");
      }
    } else {
      const { result } = await post(
        "/butlerContactService/enable",
        {},
        {
          id: record.id,
        }
      );
      if (result === 0) {
        message.success("已启用");
      }
    }
    actionRef.current?.reload();
  };

  const handleAdd = () => {
    setState({ open: true, title: "新增联系人", currentRecord: {} });
    form.resetFields();
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      contactName: record.contactName,
      contactType: record.contactType?.toString(),
      contactNumber: record.contactNumber,
      butlerUserList: record.agentWorkerList?.map((worker) => worker.userId),
      relatedType: record.relatedType?.toString(),
      relatedList: record.relatedUserList?.map((user) => user.relatedId),
      relatedTenantList: record.relatedUserList?.map((user) => user.relatedId),
    });
    if (record.relatedType == "2") {
      form.setFieldsValue({
        relatedTenantList: [],
      });
    } else if (record.relatedType == "3") {
      form.setFieldsValue({
        relatedList: [],
      });
    }
    setState({ open: true, title: "编辑联系人", currentRecord: record });
  };

  const handleDel = async (record) => {
    const res = await del("/butlerContactService/removeById", [record?.id]);
    if (res.result === 0) {
      message.success("删除成功");
    } else {
      message.error("删除失败");
    }
    actionRef.current?.reload();
  };

  const [handleFinish] = useSuperLock(async (values) => {
    // 指定用户转换格式
    if (values.relatedList) {
      values.relatedList = values.relatedList.map((id) => ({
        relatedId: id,
        relatedName:
          state.customList.find((item) => item.value === id)?.label || "",
      }));
    }
    // 指定租户转换格式
    if (values.relatedTenantList) {
      values.relatedList = values.relatedTenantList.map((id) => ({
        relatedId: id,
        relatedName:
          state.tenantList.find((item) => item.value === id)?.label || "",
      }));
      delete values.relatedTenantList;
    }
    // 管家坐席转换格式
    if (values.butlerUserList) {
      values.butlerUserList = values.butlerUserList.map((id) => ({
        userId: id,
        name:
          state.butlerContactList.find((item) => item.value === id)?.label ||
          "",
      }));
    }
    if (state.currentRecord?.id) {
      const res = await put("/butlerContactService/updateById", {
        ...values,
        id: state.currentRecord.id,
      });
      if (res.result === 0) {
        message.success("编辑成功");
      } else {
        message.error("编辑失败");
      }
    } else {
      const res = await post("/butlerContactService/save", { ...values });
      if (res.result === 0) {
        message.success("编辑成功");
      } else {
        message.error("编辑失败");
      }
    }
    setState({ open: false });
    actionRef.current?.reload();
  });

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getContactManagement}
        expandActionRender={(record) => [
          canEnable && (
            <Button
              color={record.status === 1 ? "danger" : "cyan"}
              variant="filled"
              onClick={() => handleChangeStatus(record)}
            >
              {record.status === 1 ? "停用" : "启用"}
            </Button>
          ),
          canEdit && (
            <Button
              color="primary"
              variant="filled"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          ),
        ]}
        expandToolBarRender={() => [
          canAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd()}
            >
              新建联系人
            </Button>
          ),
        ]}
        onDelete={async (record) => handleDel(record)}
        expandButtonProps={(record) => ({
          hideDeleteButton: !canDelete,
          hideDetailAction: !canShowDetail,
        })}
      />

      <ModalForm
        title={state.title}
        open={state.open}
        form={form}
        modalProps={{
          destroyOnHidden: true,
        }}
        onOpenChange={(open) => setState({ open })}
        onFinish={(values) => handleFinish(values)}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="contactName"
            label="联系人名称"
            placeholder="请输入联系人名称"
            rules={[{ required: true, message: "请输入联系人名称" }]}
          />
          <ProFormRadio.Group
            name="contactType"
            label="类型"
            options={[
              {
                label: "管家坐席",
                value: "3",
              },
            ]}
            initialValue={"3"}
          />
        </ProForm.Group>
        <ProForm.Group>
          {/* <ProFormSelect
            width="md"
            name="contactNumber"
            label="号码"
            options={state.agentList}
            placeholder="请选择坐席"
          /> */}
          <ProFormSelect
            width="md"
            name="butlerUserList"
            label="指定管家"
            options={state.butlerContactList}
            placeholder="默认为本平台所有有权限的账号"
            fieldProps={{
              mode: "multiple",
            }}
          />
        </ProForm.Group>
        <ProFormRadio.Group
          name="relatedType"
          label="关联用户"
          rules={[{ required: true, message: "请选择关联的用户或租户" }]}
          options={[
            // {
            //   label: "全部",
            //   value: "1",
            // },
            {
              label: "指定用户",
              value: "2",
            },
            {
              label: "指定租户",
              value: "3",
            },
          ]}
          initialValue={"2"}
        />
        <ProFormDependency name={["relatedType"]}>
          {({ relatedType }) => {
            if (relatedType === "2") {
              return (
                <ProFormSelect
                  width="md"
                  showSearch
                  name="relatedList"
                  label="指定用户"
                  options={state.customList}
                  placeholder="请选择用户"
                  rules={[{ required: true, message: "请选择用户" }]}
                  fieldProps={{
                    mode: "multiple",
                  }}
                  // request={async ({ keyWords }) => {
                  //   const remoteList = await remoteMethod(keyWords);
                  //   return remoteList;
                  // }}
                  // debounceTime={300}
                />
              );
            }
            if (relatedType === "3") {
              return (
                <ProFormSelect
                  width="md"
                  showSearch
                  name="relatedTenantList"
                  label="指定租户"
                  options={state.tenantList}
                  rules={[{ required: true, message: "请选择租户" }]}
                  placeholder="请选择租户"
                  fieldProps={{
                    mode: "multiple",
                  }}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
      </ModalForm>
    </>
  );
};

const ContactManagement = memo(Component);
export default ContactManagement;
