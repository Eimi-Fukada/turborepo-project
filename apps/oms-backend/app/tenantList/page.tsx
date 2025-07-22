"use client";

import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import {
  ActionType,
  ModalForm,
  ProForm,
  ProFormCascader,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import {
  App,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Tag,
  Upload,
} from "antd";
import React, { FC, memo, useEffect, useRef } from "react";
import { findNode, getAssetsUrl, listToTree } from "@/utils/help";
import { PlusOutlined } from "@ant-design/icons";
import { hasBtnPermission } from "@/utils/permission";

export interface TenantRecord {
  id?: number;
  name: string;
  code: string;
  contactName: string;
  contactMobile: string;
  city: string;
  detailAddress: string;
  tenantType: string;
  status: number;
  description: string;
  logoUrl: string;
  creatorName?: string;
  inserttime?: string;
  /** 服务类别,0-无管家服务，1有管家服务 */
  serviceType?: number;
  /** 服务有效期 */
  serviceExpire?: string;
}

export interface TenantAdminRecord {
  userId?: number;
  username: string;
  tenantId: number;
  roleMap: Record<string, string>;
  insertTime: string;
}

const Component: FC = () => {
  // 权限判断
  const canCreate = hasBtnPermission("/tenantList/tenant:add");
  const canEdit = hasBtnPermission("/tenantList/tenant:edit");
  const canDelete = hasBtnPermission("/tenantList/tenant:del");
  const canView = hasBtnPermission("/tenantList/tenant:detail");
  const canLoginUrl = hasBtnPermission("/tenantList/tenant:loginUrl");
  const canRestAdminPassword = hasBtnPermission(
    "/tenantList/tenant:resetAdminPassword"
  );
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState({
    regionTree: [] as any[],
    tenantTypeList: [] as { label: string; value: string }[],
    open: false,
    currentRecord: {} as any,
    modalType: "add" as "add" | "edit",
    loginLinkVisible: false,
    tenantDetailVisible: false,
    tenantDetail: {} as any,
    tenantAdminList: [] as TenantAdminRecord[],
    tenantLinkValue: "",
    tenantPlainLinkValue: "",
    backendLink: "",
    channelInput: "",
    butlerUserList: [] as { label: string; value: string }[],
  });
  const [form] = Form.useForm();

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "租户ID",
      dataIndex: "id",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "租户名称",
      dataIndex: "name",
      align: "center",
    },
    {
      title: "租户code码",
      dataIndex: "code",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "所属城市",
      dataIndex: "city",
      align: "center",
      valueType: "cascader",
      fieldProps: {
        options: state.regionTree,
        placeholder: "请选择城市",
        changeOnSelect: true,
        showSearch: true,
        fieldNames: { label: "name", value: "code" },
      },
      render: (_, record) => {
        const formatObject = findNode(
          state.regionTree,
          (t) => t.code === record.city,
          {}
        );
        if (!formatObject) return "-";
        return (
          <>
            {formatObject?.provinceName +
              "-" +
              formatObject?.cityName +
              "-" +
              formatObject?.name}
          </>
        );
      },
    },
    {
      title: "联系人",
      dataIndex: "contactName",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "联系电话",
      dataIndex: "contactMobile",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "租户类型",
      dataIndex: "tenantType",
      align: "center",
      fieldProps: {
        options: state.tenantTypeList,
      },
      render: (_, record) => {
        const tenantType = record?.tenantType;
        let tenantTypeName = "-";
        state.tenantTypeList.forEach((item) => {
          if (item.value == tenantType) {
            tenantTypeName = item.label;
          }
        });
        return <>{tenantTypeName}</>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.status === 1 ? "success" : "error"}>
          {record.status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建人",
      dataIndex: "creatorName",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "创建时间",
      dataIndex: "inserttime",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
  ];

  const tenantAdminColumns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "用户名",
      dataIndex: "username",
      align: "center",
    },
    {
      title: "角色",
      dataIndex: "roleMap",
      align: "center",
      render: (_, record) => {
        const roles = Object.values(record?.roleMap || {}).join(", ") || "-";
        return <>{roles}</>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "insertTime",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    ...(canRestAdminPassword
      ? [
          {
            title: "操作",
            dataIndex: "action",
            valueType: "option" as const,
            fixed: "right" as const,
            render: (_: any, record: any) => (
              <Button
                key="resetPassword"
                type="primary"
                onClick={() => resetPassword(record)}
              >
                重置密码
              </Button>
            ),
          },
        ]
      : []),
  ];

  const getTenantList = async (params) => {
    const res = await post("tenantQuery/tenantOptionList", {
      ...params,
      includeCurrentTenant: true,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getTenantAdminList = async (tenantId: number) => {
    const res = await post("/tenantQuery/getTenantAdminUserList", { tenantId });
    setState({
      tenantAdminList: res.items || [],
    });
  };

  const getTenantLoginUrl = async (
    tenantId: number,
    tenantCode: string,
    channel?: string
  ) => {
    const res = await post("/tenantQuery/tenantLink", {
      tenantId,
      tenantCode,
      channel,
    });
    return res.data;
  };

  const handleAdd = async () => {
    setState({ open: true, modalType: "add", currentRecord: undefined });
    form.resetFields();
  };

  const handleEdit = async (record: TenantRecord) => {
    setState({ open: true, modalType: "edit", currentRecord: record });
    // 修复城市回显
    const cityPath = record.city
      ? getCityPathByCode(state.regionTree, record.city)
      : [];
    form.setFieldsValue({
      ...record,
      city: cityPath,
      tenantType: String(record.tenantType),
      picture: record.logoUrl
        ? [
            {
              uid: "-1",
              name: "logo.png",
              status: "done",
              url: record.logoUrl,
            },
          ]
        : [],
    });
  };

  const handleFinish = async (values) => {
    try {
      // 处理城市字段
      const cityValue = Array.isArray(values.city)
        ? values.city[values.city.length - 1]
        : values.city;
      // 处理LOGO上传
      const uploadRes = await getAssetsUrl(values.picture);

      const formData = {
        ...values,
        city: cityValue,
        logoUrl: uploadRes[0],
        picture: undefined, // 移除 picture 字段
        status: values.status || 1,
        ...(state.modalType === "edit" && state.currentRecord?.id
          ? { id: state.currentRecord.id }
          : {}),
      };

      let res;
      if (state.modalType === "edit") {
        res = await post("/tenantQuery/updateTenant", formData);
      } else {
        res = await post("/tenantQuery/saveTenant", formData);
      }

      if (res.result === 0) {
        message.success(state.modalType === "edit" ? "编辑成功" : "新增成功");
        setState({ open: false });
        actionRef.current?.reload();
      } else {
        message.error(res.resultMessage || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  const handleLoginLink = async (record: TenantRecord) => {
    try {
      setState({
        loginLinkVisible: true,
        currentRecord: record,
        channelInput: "",
      });

      if (record.id == null) {
        message.error("租户ID不存在，无法获取登录链接");
        return;
      }
      const res = await getTenantLoginUrl(record.id, record.code);
      setState({
        tenantLinkValue: res.secretLink,
        tenantPlainLinkValue: res.plainLink,
        backendLink: res.backendLink,
      });
    } catch (error) {
      message.error("获取登录链接失败");
    }
  };

  const handleLoginLinkWithChannel = async () => {
    try {
      const res = await getTenantLoginUrl(
        state.currentRecord.id,
        state.currentRecord.code,
        state.channelInput
      );
      setState({
        tenantLinkValue: res.secretLink,
        tenantPlainLinkValue: res.plainLink,
      });
    } catch (error) {
      message.error("获取登录链接失败");
    }
  };

  const handleDetail = async (record: TenantRecord) => {
    setState({
      tenantDetailVisible: true,
      tenantDetail: record,
    });
    if (record.id == null) {
      message.error("租户ID不存在，无法获取管理员列表");
      return;
    }
    await getTenantAdminList(record.id);
  };

  const resetPassword = async (adminRecord: TenantAdminRecord) => {
    try {
      const res = await post("/tenantQuery/resetAdminPassword", {
        userId: adminRecord.userId,
        tenantId: adminRecord.tenantId,
      });
      if (res.result === 0) {
        message.success("密码重置成功");
      } else {
        message.error(res.resultMessage || "密码重置失败");
      }
    } catch (error) {
      message.error("密码重置失败");
    }
  };

  const getCityDescription = (cityCode: string) => {
    const formatObject = findNode(
      state.regionTree,
      (t) => t.code === cityCode,
      {}
    );
    if (
      formatObject &&
      formatObject.provinceName &&
      formatObject.cityName &&
      formatObject.name
    ) {
      return `${formatObject.provinceName}-${formatObject.cityName}-${formatObject.name}`;
    }
    return "未知城市";
  };

  // 统一初始化下拉选项和树形数据
  const getSelectOptions = async () => {
    const [tenantTypeRes, regionRes] = await Promise.all([
      post("/tenantQuery/getTenantTypeList"),
      get("regionQuery/list"),
    ]);
    const tenantTypeList = tenantTypeRes.data;
    const regionTree = listToTree(regionRes.data, {
      id: "code",
      children: "children",
      pid: "parentCode",
    });
    setState({
      tenantTypeList,
      regionTree,
    });
  };

  useEffect(() => {
    getSelectOptions();
  }, []);

  const handleDel = async (record: TenantRecord): Promise<void> => {
    await post("/tenantQuery/delTenant", [record.id]);
  };

  // 获取城市路径（用于Cascader回显）
  function getCityPathByCode(tree: any[], code: string): string[] {
    let path: string[] = [];

    function dfs(nodes, target, currentPath) {
      for (const node of nodes) {
        const nextPath = [...currentPath, node.code];
        if (node.code === target) {
          path = nextPath;
          return true;
        }
        if (node.children && dfs(node.children, target, nextPath)) {
          return true;
        }
      }
      return false;
    }

    dfs(tree, code, []);
    return path;
  }

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getTenantList}
        onDelete={(record) => handleDel(record)}
        expandButtonProps={(record) => ({
          hideDeleteButton: !canDelete,
          hideEditButton: !canEdit,
          hideDetailAction: true,
        })}
        expandToolBarRender={(defaultBtns) =>
          [
            ...defaultBtns,
            canCreate && (
              <Button
                type="primary"
                onClick={handleAdd}
                icon={<PlusOutlined />}
              >
                新增租户
              </Button>
            ),
          ].filter(Boolean)
        }
        expandActionRender={(record) =>
          [
            canEdit && (
              <Button
                color="primary"
                key="edit"
                variant="filled"
                onClick={async () => await handleEdit(record)}
              >
                编辑
              </Button>
            ),
            canLoginUrl && (
              <Button
                key="loginUrl"
                type="primary"
                onClick={() => handleLoginLink(record)}
              >
                链接
              </Button>
            ),
            canView && (
              <Button
                color={"cyan"}
                variant="filled"
                key="detail"
                type="primary"
                onClick={() => handleDetail(record)}
              >
                详情
              </Button>
            ),
          ].filter(Boolean)
        }
      />

      <ModalForm
        key={state.modalType + (state.currentRecord?.id || "")}
        form={form}
        title={state.modalType === "add" ? "新增租户" : "编辑租户"}
        open={state.open}
        onOpenChange={(open) => setState({ open })}
        onFinish={handleFinish}
        width={800}
        modalProps={{ destroyOnHidden: true }}
        grid
        rowProps={{ gutter: [16, 0] }}
        colProps={{ span: 12 }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="租户名称"
            placeholder="请输入租户名称"
            rules={[{ required: true, message: "请输入租户名称" }]}
            fieldProps={{ maxLength: 15 }}
          />
          <ProFormText
            name="code"
            label="租户code"
            placeholder="不填会自动生成"
            fieldProps={{
              maxLength: 16,
              disabled: state.modalType === "edit",
            }}
          />
        </ProForm.Group>

        <ProForm.Group>
          <ProFormSelect
            name="tenantType"
            label="租户类型"
            options={state.tenantTypeList}
            rules={[{ required: true, message: "请选择租户类型" }]}
          />
          <ProFormSelect
            name="status"
            label="状态"
            options={[
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ]}
            initialValue={1}
          />
        </ProForm.Group>

        <ProForm.Group>
          <ProFormText
            name="contactName"
            label="联系人"
            placeholder="请输入联系人"
            rules={[{ required: true, message: "请输入联系人" }]}
            fieldProps={{ maxLength: 15 }}
          />
          <ProFormText
            name="contactMobile"
            label="联系电话"
            placeholder="请输入联系电话"
            rules={[
              { required: true, message: "请输入联系电话" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
            ]}
            fieldProps={{ maxLength: 11 }}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormCascader
            name="city"
            label="所属城市"
            fieldProps={{
              options: state.regionTree,
              fieldNames: {
                label: "name",
                value: "code",
                children: "children",
              },
              changeOnSelect: true,
              showSearch: true,
            }}
            rules={[{ required: true, message: "请选择所属城市" }]}
          />
          <ProFormText
            name="detailAddress"
            label="详细地址"
            placeholder="请输入详细地址"
            fieldProps={{ maxLength: 60 }}
          />
        </ProForm.Group>

        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入描述"
          fieldProps={{ maxLength: 30 }}
        />
        <ProForm.Item
          name="picture"
          label="LOGO"
          valuePropName="fileList" // 这里需要显式声明绑定 fileList
          getValueFromEvent={(e) => {
            //这里直接返回fileList吧，实际处理的也是这个
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            listType="picture-card"
            accept="image/*"
            beforeUpload={(file) => {
              if (file.size / 1024 / 1024 > 1) {
                message.error("图片大小不能超过1M");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            maxCount={1}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
        </ProForm.Item>

        <ProForm.Group>
          <ProFormSelect
            name="serviceType"
            label="服务类别"
            options={[
              { label: "无管家服务", value: 0 },
              { label: "有管家服务", value: 1 },
            ]}
            rules={[{ required: true, message: "请选择服务类别" }]}
          />
          <ProFormDateTimePicker
            name="serviceExpire"
            label="服务有效期"
            placeholder="请选择服务有效期"
          />
        </ProForm.Group>
      </ModalForm>

      {/* 登录链接弹窗 */}
      <Modal
        title="登录链接"
        open={state.loginLinkVisible}
        onCancel={() => setState({ loginLinkVisible: false })}
        footer={[
          <Button
            key="close"
            onClick={() => setState({ loginLinkVisible: false })}
          >
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>C端加密链接:</div>
          <div style={{ marginBottom: 20, wordBreak: "break-all" }}>
            {state.tenantLinkValue}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>C端原始链接:</div>
          <div style={{ marginBottom: 20, wordBreak: "break-all" }}>
            {state.tenantPlainLinkValue}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>渠道名:</div>
          <div style={{ display: "flex", gap: 16 }}>
            <Input
              placeholder="请输入渠道名"
              value={state.channelInput}
              onChange={(e) => setState({ channelInput: e.target.value })}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleLoginLinkWithChannel}>
              确定
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>B端登录链接:</div>
          <div style={{ wordBreak: "break-all" }}>{state.backendLink}</div>
        </div>
      </Modal>

      {/* 租户详情弹窗 */}
      <Modal
        title="租户详情"
        open={state.tenantDetailVisible}
        onCancel={() => setState({ tenantDetailVisible: false })}
        footer={[
          <Button
            key="close"
            onClick={() => setState({ tenantDetailVisible: false })}
          >
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Descriptions title="租户信息" column={2} bordered>
          <Descriptions.Item label="租户名称">
            {state.tenantDetail?.name}
          </Descriptions.Item>
          <Descriptions.Item label="租户code">
            {state.tenantDetail?.code}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">
            {state.tenantDetail?.contactName}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">
            {state.tenantDetail?.contactMobile}
          </Descriptions.Item>
          <Descriptions.Item label="所属城市">
            {getCityDescription(state.tenantDetail?.city)}
          </Descriptions.Item>
          <Descriptions.Item label="详细地址">
            {state.tenantDetail?.detailAddress}
          </Descriptions.Item>
          <Descriptions.Item label="服务类别">
            {state.tenantDetail?.serviceType === 1
              ? "有管家服务"
              : "无管家服务"}
          </Descriptions.Item>
          <Descriptions.Item label="服务有效期">
            {state.tenantDetail?.serviceExpire || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {state.tenantDetail?.status == 1 ? "启用" : "禁用"}
          </Descriptions.Item>
          <Descriptions.Item label="描述">
            {state.tenantDetail?.description}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">
            {state.tenantDetail?.creatorName}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {state.tenantDetail?.inserttime}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            管理员列表
          </div>
          <ProTable
            search={false}
            columns={tenantAdminColumns}
            dataSource={state.tenantAdminList}
            pagination={false}
            toolBarRender={false}
            headerTitle={null}
            options={false}
            style={{ fontWeight: 500 }}
          />
        </div>
      </Modal>
    </>
  );
};

const TenantList = memo(Component);
export default TenantList;
