"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { ActionType } from "@ant-design/pro-components";
import { Tabs, Button, Modal, message } from "antd";
import { FC, memo, useEffect, useState, useRef } from "react";
import { mapDeviceTypeName } from "@/enums/deviceEnum";
import { formatDuration } from "@/utils/help";

interface AlertRecordsProps {
  butlerUserId: string;
  canViewDetail: boolean;
  canClose: boolean;
}

interface ButlerAlertCountResponse {
  waitHandleCount: number;
  waitFollowUpCount: number;
  closedCount: number;
}

const Component: FC<AlertRecordsProps> = ({
  butlerUserId,
  canViewDetail,
  canClose,
}) => {
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState<{
    workList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
    alertStats: ButlerAlertCountResponse; // 添加统计数据
  }>({
    workList: [],
    tenantList: [],
    alertStats: { waitHandleCount: 0, waitFollowUpCount: 0, closedCount: 0 },
  });
  const [activeTab, setActiveTab] = useState<string>("0");

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      align: "center" as const,
    },
    {
      title: "报警工单ID",
      dataIndex: "alertNo",
      align: "center" as const,
    },
    {
      title: "设备类型",
      dataIndex: "deviceType",
      align: "center" as const,
      renderText: (text, record, index, action) => {
        return mapDeviceTypeName(record.deviceType);
      },
    },
    {
      title: "设备来源",
      dataIndex: "deviceSource",
      align: "center" as const,
    },
    {
      title: "硬件名称",
      dataIndex: "deviceName",
      align: "center" as const,
    },
    {
      title: "硬件设备号",
      dataIndex: "deviceSn",
      align: "center" as const,
      search: false,
    },
    {
      title: "报警时间",
      dataIndex: "alertTime",
      align: "center" as const,
    },
    {
      title: "处理时长",
      dataIndex: "duration",
      align: "center" as const,
      search: false,
      renderText: (text, record, index, action) => {
        return `${formatDuration(record.alertStatus, record.duration)}`;
      },
    },
    {
      title: "处理人",
      dataIndex: "handlerUserName",
      align: "center" as const,
      search: false,
    },
  ];

  const getAlertRecords = async () => {
    const res = await get("/butlerAlertService/page", {
      userId: butlerUserId,
      alertStatus: activeTab,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getAlertRecordStatisticsApi = async () => {
    const res = await get("/butlerAlertService/butlerAlertCount", {
      butlerUserId: butlerUserId,
    });
    setState({
      alertStats: res.data, // 假设接口返回的数据结构符合CallRecordSummaryResponse
    });
  };

  useEffect(() => {
    getAlertRecordStatisticsApi();
  }, []);

  function handleDetail(record: any): void {
    Modal.confirm({
      title: "删除提示",
      content: `您确定要关闭工单吗?`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      async onOk() {
        const res = await get("/butlerAlertService/closeAlert", {
          alertId: record.id,
        });
        if (res.result === 0) {
          actionRef.current?.reload();
          getAlertRecordStatisticsApi();
          message.success("关闭工单成功");
        } else {
          message.error(res.resultMessage || "关闭工单失败");
        }
      },
    });
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        className="mb-0" // 移除默认的margin-bottom
        tabBarStyle={{ marginBottom: 0, marginLeft: 12 }} // 确保Tab栏下方没有额外间距
      >
        <Tabs.TabPane
          tab={`待处理(${state.alertStats.waitHandleCount})`}
          key="0"
        />
        <Tabs.TabPane
          tab={`待回访(${state.alertStats.waitFollowUpCount})`}
          key="1"
        />
        <Tabs.TabPane tab={`已关闭(${state.alertStats.closedCount})`} key="2" />
      </Tabs>

      <GenericTable
        actionRef={actionRef}
        search={false}
        columns={columns}
        request={getAlertRecords}
        expandButtonProps={(record) => ({
          hideDetailAction: !canViewDetail,
        })}
        key={activeTab}
        className="mt-0 [&_.ant-pro-table-list-toolbar]:hidden"
        style={{ marginTop: 5, marginLeft: -10 }} // 双重保障
        expandActionRender={(record) => [
          record.alertStatus == 0 && canClose && (
            <Button
              key="detail"
              type="primary"
              onClick={() => handleDetail(record)}
            >
              关闭工单
            </Button>
          ),
        ]}
      />
    </div>
  );
};

const AlertListComponent = memo(Component);
export default AlertListComponent;
