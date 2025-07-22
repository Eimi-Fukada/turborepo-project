"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { get, post } from "@/request";
import { useUserStore } from "@/stores/useUserStore";
import { exportFile } from "@/utils/help";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, Form, Modal } from "antd";
import {
  ActionType,
  ModalForm,
  ProFormSelect,
} from "@ant-design/pro-components";
import { FC, memo, useEffect, useState, useRef } from "react";
import AlertDetailModal from "./components/alertDetailModal";
import { DeviceTypeOptions, DeviceTypeValueEnum } from "@/enums/deviceEnum";
import {
  AlertStatusOptions,
  AlertStatusValueEnum,
} from "@/enums/alertStatusEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { useSearchParams } from "next/navigation";
import { hasBtnPermission } from "@/utils/permission";
const Component: FC = () => {
  const canShowDetail = hasBtnPermission("butlerAlert:viewDetail");
  const canExport = hasBtnPermission("butlerAlert:batchExport");
  const canAssign = hasBtnPermission("butlerAlert:assgineWorker");
  const canCloseOrder = hasBtnPermission("butlerAlert:closeOrder");

  const searchParams = useSearchParams();
  const deviceSn = searchParams.get("deviceSn");

  const [state, setState] = useCallBackState<{
    workList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
    assignModalVisible: boolean; // 新增指派工单弹窗可见状态
    assignWorkerId: string;
  }>({
    workList: [],
    tenantList: [],
    assignModalVisible: false,
    assignWorkerId: "",
  });
  const [form] = Form.useForm();
  const userInfo = useUserStore((state) => state.userInfo);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [alertId, setAlertId] = useState(0);
  const actionRef = useRef<ActionType>(null);

  const formatDuration = (duration: number) => {
    if (!duration) return "-";

    const days = Math.floor(duration / 86400);
    const hours = Math.floor((duration % 86400) / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const parts = [] as string[];
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分`);
    if (seconds > 0 && parts.length < 2) parts.push(`${seconds}秒`);

    return parts.join("");
  };

  const getWorkerList = async () => {
    const res = await post("/butlerWorkerService/page", {
      startPage: 1,
      pageSize: 999,
    });
    const workerList = res.items.map((i) => ({
      value: i.userId,
      label: i.realName,
    }));
    setState({ workList: workerList });
  };

  const handleCloseAlert = (alertId: number) => {
    get("/butlerAlertService/closeAlert", { alertId }).then((res) => {
      actionRef.current?.reload();
    });
  };

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "报警工单ID",
      dataIndex: "alertNo",
    },
    {
      title: "用户姓名",
      dataIndex: "userName",
    },
    {
      title: "联系方式",
      dataIndex: "phoneNumber",
      renderText: (text, record, index, action) => {
        return (
          <>
            {record.phoneNumber + "(" + mapRelationName(record.relation) + ")"}
          </>
        );
      },
    },
    // {
    //   title: "所属城市",
    //   dataIndex: "city",
    // },
    {
      title: "所属租户",
      dataIndex: "tenantId",
      valueType: "select",
      fieldProps: {
        options: state.tenantList,
      },
      renderText: (text, record, index, action) => {
        return (
          <>
            {state.tenantList.find((i) => i.value === record?.tenantId)?.label}
          </>
        );
      },
    },
    {
      title: "设备类型",
      dataIndex: "deviceType",
      valueType: "select",
      fieldProps: {
        options: DeviceTypeOptions,
      },
      valueEnum: DeviceTypeValueEnum,
    },
    {
      title: "设备来源",
      dataIndex: "deviceSource",
      search: false,
    },
    {
      title: "硬件名称",
      dataIndex: "deviceName",
      search: false,
    },
    {
      title: "硬件设备号",
      dataIndex: "deviceSn",
      initialValue: deviceSn,
    },
    {
      title: "报警时间",
      dataIndex: "alertTimeRange",
      valueType: "dateRange",
      search: {
        transform: (value) => {
          if (value && Array.isArray(value)) {
            return {
              alertStartTime: value[0] + " 00:00:00",
              alertEndTime: value[1] + " 23:59:59",
            };
          }
          return {};
        },
      },
      render: (text, record) => {
        return record.alertTime || "-";
      },
      fieldProps: {
        placeholder: ["开始日期", "结束日期"],
        style: { width: "100%" },
      },
    },
    {
      title: "处理时长",
      dataIndex: "duration",
      search: false,
      renderText: (text, record, index, action) => {
        return <>{formatDuration(record.duration)}</>;
      },
    },
    {
      title: "状态",
      dataIndex: "alertStatus",
      valueType: "select",
      fieldProps: {
        options: AlertStatusOptions,
      },
      valueEnum: AlertStatusValueEnum,
    },
    {
      title: "处理人",
      dataIndex: "handlerUserName",
      search: false,
    },
  ];

  const getAkertList = async (params) => {
    const res = await get("/butlerAlertService/page", {
      deviceSn: deviceSn,
      ...params,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getSelectOptions = async () => {
    const [tenantData] = await Promise.all([
      post("tenantQuery/tenantOptionList", {
        startPage: 1,
        pageSize: 100,
        includeCurrentTenant: true,
      }),
    ]);
    const tenantList = tenantData.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const [handleExport, loading] = useSuperLock(async (searchParams) => {
    const res = await get(
      "/butlerAlertService/export",
      {
        ...searchParams?.params,
      },
      { responseType: "blob" }
    );
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      ?.replace(/-/g, "");
    const username = userInfo?.realName;
    const fileName = `报警工单列表_${currentDate}_${username}.xlsx`;
    exportFile(fileName, res.data);
  });

  useEffect(() => {
    getSelectOptions();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getAkertList}
        expandActionRender={(record) => [
          canShowDetail && (
            <Button
              color={"cyan"}
              variant="filled"
              onClick={() => {
                setAlertId(record.id);
                setIsDetailModalOpen(true);
              }}
            >
              详情
            </Button>
          ),
          canAssign && (
            <Button
              color={"cyan"}
              variant="filled"
              onClick={() => {
                form.resetFields();
                getWorkerList(); // 获取工人列表
                setAlertId(record.id);
                setState({ assignModalVisible: true }); // 打开指派弹窗
              }}
            >
              指派工单
            </Button>
          ),
          canCloseOrder && record.alertStatus !== 2 && (
            <Button
              type="primary"
              variant="filled"
              onClick={() => {
                Modal.confirm({
                  title: "确认关闭工单?",
                  content: "确定要关闭当前报警工单吗?",
                  okText: "确认",
                  cancelText: "取消",
                  onOk: () => handleCloseAlert(record.id),
                });
              }}
            >
              关闭工单
            </Button>
          ),
        ]}
        expandButtonProps={(record) => ({
          hideDetailAction: true,
        })}
        expandToolBarRender={(_, searchParams) => [
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
      />

      <AlertDetailModal
        visible={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
        }}
        formatDuration={formatDuration}
        alertId={alertId}
      />

      <ModalForm
        title="指派工单"
        open={state.assignModalVisible}
        form={form}
        onFinish={() =>
          post("/butlerAlertService/assignHandleWorker", {
            alertId: alertId,
            workerId: state.assignWorkerId,
          }).then((res) => {
            if (res.result === 0) {
              setState({ assignModalVisible: false });
              actionRef.current?.reload();
            }
          })
        }
        onOpenChange={(open) => setState({ assignModalVisible: open })}
      >
        <ProFormSelect
          width="md"
          name="assignWorkerId"
          label="指定管家"
          options={state.workList}
          rules={[{ required: true, message: "请选择管家" }]}
          onChange={(value) => setState({ assignWorkerId: value as string })}
          placeholder="请选择待分配的管家"
        />
      </ModalForm>
    </>
  );
};

const PrivilegeList = memo(Component);
export default PrivilegeList;
