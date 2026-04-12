"use client";

import { DeviceType } from "@/enums/deviceEnum";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { get, post } from "@/request";
import { useUserStore } from "@/stores/useUserStore";
import { exportFile, findNode, listToTree } from "@/utils/help";
import {
  ActionType,
  ModalForm,
  ProFormSelect,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, Form, App } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const canBind = hasBtnPermission("/deviceList/deviceService:bind");
  const canExport = hasBtnPermission("/deviceList/deviceService:export");
  const canImport = hasBtnPermission("/deviceList/deviceService:import");
  const canShowUser = hasBtnPermission("/deviceList/deviceService:showUser");

  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState({
    tenantList: [] as { label: string; value: string }[],
    regionTree: [] as any[],
    open: false,
    currentRecord: {} as any,
    butlerUserList: [],
  });
  const userInfo = useUserStore((state) => state.userInfo);
  const [form] = Form.useForm();

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      dataIndex: "code",
      title: "设备S/N",
    },
    {
      dataIndex: "model",
      title: "设备型号",
    },
    {
      dataIndex: "sourceCode",
      title: "来源",
      fieldProps: {
        options: [
          { value: "baidu", label: "百度智能云" },
          { value: "kang_guan", label: "康冠" },
        ],
      },
      valueEnum: {
        baidu: { text: "百度智能云", status: "Processing" },
        kang_guan: { text: "康冠", status: "Default" },
      },
    },
    {
      dataIndex: "status",
      title: "设备状态",
      fieldProps: {
        options: [
          { value: 0, label: "未管理" },
          { value: 1, label: "在线" },
          { value: 2, label: "离线" },
        ],
      },
      valueEnum: {
        0: { text: "未管理", status: "Default" },
        1: { text: "在线", status: "Success" },
        2: { text: "离线", status: "Error" },
      },
    },
    {
      dataIndex: "tenantId",
      title: "所属租户",
      valueType: "select",
      fieldProps: {
        options: state.tenantList,
      },
    },
    {
      dataIndex: "city",
      title: "所属城市",
      valueType: "cascader",
      fieldProps: {
        options: state.regionTree,
        placeholder: "请选择城市",
        changeOnSelect: true,
        showSearch: true,
        fieldNames: { label: "name", value: "code" },
      },
      renderText(text, record, index, action) {
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
      dataIndex: "userName",
      title: "关联用户",
      renderText(text, record, index, action) {
        const userName = record.butlerUserId != -1 ? record.userName : "-";
        return <>{userName}</>;
      },
    },
    {
      dataIndex: "phoneNumber",
      title: "联系电话",
      renderText(text, record, index, action) {
        const phoneNumber =
          record.butlerUserId != -1
            ? mapRelationName(record?.phoneRelation) + "-" + record?.phoneNumber
            : "-";
        return <>{phoneNumber}</>;
      },
    },
  ];

  const getDeviceList = async (params) => {
    const res = await get("deviceService/page", {
      ...params,
      type: DeviceType.SLIGHTLY,
      descs: "id",
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getTenantList = async () => {
    const res = await post("tenantQuery/tenantOptionList", {
      startPage: 1,
      pageSize: 100,
      includeCurrentTenant: true,
    });
    const tenantList = res.items?.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const getRegionList = async () => {
    const res = await get("regionQuery/list");
    const regionTree = listToTree(res.data, {
      id: "code",
      children: "children",
      pid: "parentCode",
    });
    setState({
      regionTree,
    });
  };

  const getButlerUserList = async () => {
    const { data } = await get("butlerUserService/listForBind");
    const butlerUserList = data.map((i) => {
      return {
        label: i.userName,
        value: i.id,
        ...i,
      };
    });
    setState({
      butlerUserList,
    });
  };

  const [handleExport, loading] = useSuperLock(async (searchParams) => {
    const res = await get(
      "/deviceService/export",
      {
        type: DeviceType.SLIGHTLY,
        ...searchParams?.params,
      },
      { responseType: "blob" }
    );
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      ?.replace(/-/g, "");
    const username = userInfo?.realName;
    const fileName = `设备列表_${currentDate}_${username}.xlsx`;
    exportFile(fileName, res.data);
  });

  const handleUpload = async (file) => {
    const rawFile = file.upload[0].originFileObj as File;
    const formData = new FormData();
    formData.append("file", rawFile);
    const res = await post("/deviceService/import", formData);
    if (res.result === 201) {
      return { data: res.data };
    } else if (res.result === 0) {
      actionRef.current?.reload();
      message.success("导入成功");
    }
  };

  const handleFinish = async (values) => {
    const res = await post("/butlerUserService/device-bind", {
      deviceType: DeviceType.SLIGHTLY,
      butlerUserId: values.butlerUserId,
      deviceSn: state.currentRecord?.code,
    });
    if (res.result === 0) {
      message.success("关联成功");
    } else {
      message.error(res.resultMessage);
    }
    actionRef.current?.reload();
  };

  useEffect(() => {
    getButlerUserList();
    getTenantList();
    getRegionList();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getDeviceList}
        expandButtonProps={(record) => ({
          hideUploadButton: !canImport,
        })}
        expandToolBarRender={(defaultBtns, searchParams) => [
          ...defaultBtns,
          canExport && (
            <Button
              type="primary"
              onClick={() => handleExport(searchParams)}
              loading={loading}
            >
              导出数据
            </Button>
          ),
        ]}
        expandActionRender={(record) => [
          canBind && record.butlerUserId === "-1" && (
            <Button
              color="green"
              variant="filled"
              onClick={() => setState({ open: true, currentRecord: record })}
            >
              关联用户
            </Button>
          ),
        ]}
        uploadProps={{
          templateUrl:
            "https://digital-tec-pub.eos-wuxi-1.cmecloud.cn/sky/import_device_template.xlsx",
          onUpload: async (file) => {
            return await handleUpload(file);
          },
        }}
      />

      <ModalForm
        title="关联用户"
        open={state.open}
        form={form}
        modalProps={{
          destroyOnHidden: true,
        }}
        onOpenChange={(open) => setState({ open })}
        onFinish={(values) => handleFinish(values)}
      >
        <ProFormSelect
          width="md"
          name="butlerUserId"
          label="选择用户"
          options={state.butlerUserList}
          showSearch={true}
          placeholder="请输入用户姓名/联系方式"
          rules={[{ required: true, message: "请选择用户" }]}
          fieldProps={{
            optionLabelProp: "label",
            optionRender: (option) => {
              const user = option.data as any;
              return (
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-100 p-2 cursor-pointer">
                  <div className="flex items-center">
                    <div className="ml-2 flex-1">
                      <div className="flex items-center">
                        {user.userName}
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${user.gender === 1 ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}
                        >
                          {mapGenderName(user.gender)}
                        </span>
                        {user.age && (
                          <span className="ml-2 text-sm text-gray-700">
                            {user.age}岁
                          </span>
                        )}
                      </div>
                      {/* 手机号 */}
                      <div className="mt-1 text-sm text-gray-700">
                        手机号：({mapRelationName(user.phoneRelation)})
                        {user.phoneNumber}
                      </div>
                      {/* 所属租户 */}
                      <div className="mt-1 text-sm text-gray-700 flex items-center">
                        所属租户：{user.tenantName}
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          }}
        />
      </ModalForm>
    </>
  );
};

const DeviceList = memo(Component);
export default DeviceList;
