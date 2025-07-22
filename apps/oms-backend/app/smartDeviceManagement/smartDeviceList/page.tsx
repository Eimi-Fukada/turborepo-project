"use client";

import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import { findNode, listToTree } from "@/utils/help";
import {
  ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, Tabs, App, Form } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import SmartDeviceDetailModal from "./components/detailModal";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const canBind = hasBtnPermission("smartDevice:bind");
  const canUnBind = hasBtnPermission("smartDevice:unbind");
  const canShowDetail = hasBtnPermission("smartDevice:showDetail");
  const canEdit = hasBtnPermission("smartDevice:edit");
  const canUpload = hasBtnPermission("smartDevice:upload");

  const actionRef = useRef<ActionType>(null);
  const { modal, message } = App.useApp();
  const [state, setState] = useCallBackState({
    activeKey: "4",
    tabCounts: {} as any,
    regionTree: [] as any[],
    open1: false,
    open2: false,
    butlerUserList: [],
    openDetail: false,
    currentDevice: null, // 当前查看的设备
  });

  const handleViewDetail = (record) => {
    setState({
      openDetail: true,
      currentDevice: record,
    });
  };

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const tabItems = [
    {
      key: "4",
      label: `网关${state.tabCounts.gateWayOnline}/${state.tabCounts.gateWay}`,
    },
    {
      key: "2",
      label: `拉绳报警器${state.tabCounts.pullCordAlarmOnline}/${state.tabCounts.pullCordAlarm}`,
    },
    {
      key: "1",
      label: `防跌倒激光雷达${state.tabCounts.fallDetectionLidarOnline}/${state.tabCounts.fallDetectionLidar}`,
    },
    {
      key: "3",
      label: `睡眠检测带${state.tabCounts.sleepMonitorBeltOnline}/${state.tabCounts.sleepMonitorBelt}`,
    },
  ];

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "硬件名称",
      dataIndex: "name",
    },
    {
      title: "硬件设备号",
      dataIndex: "code",
    },
    {
      title: "设备来源",
      dataIndex: "sourceCode",
      valueType: "select",
      fieldProps: {
        options: [{ value: "wanfeng", label: "万沣" }],
      },
      valueEnum: {
        wanfeng: { text: "万沣", status: "Default" },
      },
    },
    {
      title: "设备状态",
      dataIndex: "status",
      valueType: "select",
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
      title: "关联用户",
      dataIndex: "userName",
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

  const getList = async (params) => {
    const res = await get("/deviceService/page", {
      ...params,
      descs: "id",
      type: state.activeKey,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getDeviceStatistics = async () => {
    const res = await get("/deviceService/statistics");
    setState({
      tabCounts: res.data,
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
    const { data } = await get("butlerUserService/list");
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

  const handleUnBind = async (record) => {
    modal.confirm({
      title: "解绑提示",
      content: "您确定要解绑设备吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await post("/butlerUserService/device-unbind", {
          butlerUserId: record.butlerUserId,
          deviceSn: record.code,
          deviceType: record.type,
        });
        message.success("解绑成功!");
      },
    });
  };

  const handleEdit = (record) => {
    setState({
      open1: true,
    });
    form1.setFieldsValue({
      name: record.name,
    });
  };

  const handleFinish1 = async (values) => {
    const { result } = await post("/deviceService/updateDeviceName", {
      name: values.name,
    });
    if (result === 0) {
      message.success("编辑成功");
    } else {
      message.error("编辑失败");
    }
    setState({
      open1: false,
    });
  };

  const handleBindUser = (record) => {
    setState({
      open2: true,
    });
    // form2.setFieldsValue({
    //   butlerUserId: record.butlerUserId,
    // });
  };

  const handleFinish2 = async (values) => {
    const { result } = await post("/butlerUserService/device-bind", {
      butlerUserId: values.butlerUserId,
    });
    if (result === 0) {
      message.success("关联成功");
    } else {
      message.error("关联失败");
    }
    setState({
      open2: false,
    });
  };

  const handleUpload = async (file) => {
    const rawFile = file.upload[0].originFileObj as File;
    const formData = new FormData();
    formData.append("file", rawFile);
    const res = await post("/deviceService/importSmartDevice", formData);
    if (res.result === 201) {
      return { data: res.data };
    } else if (res.result === 0) {
      actionRef.current?.reload();
      message.success("导入成功");
    }
  };

  useEffect(() => {
    getDeviceStatistics();
    getRegionList();
    getButlerUserList();
  }, []);

  return (
    <>
      <Tabs
        activeKey={state.activeKey}
        onChange={(activeKey) => {
          setState({ activeKey }), actionRef.current?.reload();
        }}
        type="card"
        size={"middle"}
        style={{ marginBottom: 32 }}
        items={tabItems}
      />
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getList}
        expandActionRender={(record) => [
          canBind && record.butlerUserId === "-1" && (
            <Button
              color={"cyan"}
              variant="filled"
              onClick={() => handleBindUser(record)}
            >
              关联用户
            </Button>
          ),
          canUnBind && record.butlerUserId != "-1" && (
            <Button
              color={"danger"}
              variant="filled"
              onClick={() => handleUnBind(record)}
            >
              解绑
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
          canShowDetail && (
            <Button
              color="cyan"
              variant="filled"
              onClick={() => handleViewDetail(record)}
            >
              查看详情
            </Button>
          ),
        ]}
        expandButtonProps={(record) => ({
          hideUploadButton: !canUpload,
          hideDetailAction: true,
        })}
        uploadProps={{
          templateUrl:
            "https://digital-tec-pub.eos-wuxi-1.cmecloud.cn/sky/import_samrt_device_template.xlsx",
          onUpload: async (file) => {
            return await handleUpload(file);
          },
        }}
      />
      <ModalForm
        title={"编辑硬件设备"}
        open={state.open1}
        form={form1}
        modalProps={{
          destroyOnHidden: true,
        }}
        onOpenChange={(open) => setState({ open1: open })}
        onFinish={(values) => handleFinish1(values)}
      >
        <ProFormText
          width="md"
          name="name"
          label="硬件名称"
          placeholder="请输入硬件名称"
          rules={[{ required: true, message: "请输入硬件名称" }]}
        />
      </ModalForm>
      <ModalForm
        title={"关联用户"}
        open={state.open2}
        form={form2}
        modalProps={{
          destroyOnHidden: true,
        }}
        onOpenChange={(open) => setState({ open2: open })}
        onFinish={(values) => handleFinish2(values)}
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
                <div>
                  <div className="justify-around">
                    <span>{user.userName}</span>
                    <span style={{ marginLeft: 8 }}>
                      {mapGenderName(user.gender)}
                    </span>
                    <span style={{ marginLeft: 8 }}>{user.age}</span>
                  </div>
                  <div className="justify-around">
                    <span>
                      手机号：({mapRelationName(user.phoneRelation)})
                      {user.phoneNumber}
                    </span>
                  </div>
                  <div className="justify-around">
                    <span>所属租户：{user.tenantName}</span>
                  </div>
                </div>
              );
            },
          }}
        />
      </ModalForm>
      <SmartDeviceDetailModal
        open={state.openDetail}
        onClose={() => setState({ openDetail: false })}
        device={state.currentDevice ?? {}}
      />
    </>
  );
};

const SmartDeviceList = memo(Component);
export default SmartDeviceList;
