"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get } from "@/request";
import { formatDuration } from "@/utils/help";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Tabs } from "antd";
import { FC, memo, useEffect, useState } from "react";
import { enum2SelectOptions, enum2ValueEnum } from "@/utils/enumUtils";
import {
  CallStatus,
  CallType,
  mapCallStatusName,
  mapCallTypeName,
} from "@/enums/callRecordEnum";

interface CallRecordsProps {
  userId: string;
  canViewDetail: boolean;
}

interface CallRecordSummaryResponse {
  answerCount: number;
  rejectCount: number;
  unAnswerCount: number;
}

const Component: FC<CallRecordsProps> = ({ userId, canViewDetail }) => {
  const [state, setState] = useCallBackState<{
    workList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
    callStats: CallRecordSummaryResponse; // 添加统计数据
  }>({
    workList: [],
    tenantList: [],
    callStats: { answerCount: 0, rejectCount: 0, unAnswerCount: 0 },
  });
  const [activeTab, setActiveTab] = useState<string>("1");

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      align: "center" as const,
    },
    {
      title: "通话标识",
      dataIndex: "urgentType",
      align: "center" as const,
      renderText(text, record, index, action) {
        return <>{record.urgentType === 1 ? "常规" : "告警"}</>;
      },
      search: false,
    },
    {
      title: "通话用户",
      dataIndex: "butlerUserName",
      align: "center" as const,
    },
    {
      title: "通话类型",
      dataIndex: "callType",
      valueType: "select",
      align: "center" as const,
      fieldProps: {
        options: enum2SelectOptions(CallType, mapCallTypeName),
      },
      valueEnum: enum2ValueEnum(CallType, mapCallTypeName),
    },
    {
      title: "通话状态",
      dataIndex: "callStatus",
      align: "center" as const,
      valueType: "select",
      fieldProps: {
        options: enum2SelectOptions(CallStatus, mapCallStatusName),
      },
      valueEnum: enum2ValueEnum(CallStatus, mapCallStatusName),
    },
    {
      title: "呼叫时间",
      dataIndex: "inserttime",
      align: "center" as const,
      search: false,
    },
    {
      title: "通话时长",
      dataIndex: "duration",
      align: "center" as const,
      search: false,
      renderText: (text, record, index, action) => {
        return <>{formatDuration(record.callStatus, record.duration)}</>;
      },
    },
    {
      title: "触发来源",
      dataIndex: "urgentDeviceType",
      hidden: true,
      align: "center" as const,
      search: false,
    },
    {
      title: "硬件设备号",
      dataIndex: "urgentDeviceImei",
      hidden: true,
      align: "center" as const,
      search: false,
    },
    {
      title: "硬件名称",
      dataIndex: "urgentDeviceName",
      hidden: true,
      search: false,
      align: "center" as const,
    },
    {
      title: "指派管家",
      dataIndex: "username",
      search: false,
      align: "center" as const,
    },
    {
      title: "所属租户",
      dataIndex: "tenantName",
      align: "center" as const,
    },
  ];

  const getCallRecords = async (params) => {
    const res = await get("/callRecordsService/withButlerUserCallRecord", {
      butlerUserId: userId,
      callStatus: activeTab,
      ...params,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getCallRecordStatisticsApi = async () => {
    const res = await get("/callRecordsService/callRecordSummary", {
      butlerUserId: userId,
    });
    setState({
      callStats: res.data, // 假设接口返回的数据结构符合CallRecordSummaryResponse
    });
  };

  //   const getSelectOptions = async () => {
  //     const [workData, tenantData] = await Promise.all([
  //       post("/butlerWorkerService/page", {
  //         pageSize: 100,
  //         startPage: 1,
  //       }),
  //       post("tenantQuery/tenantOptionList", {
  //         startPage: 1,
  //         pageSize: 100,
  //         includeCurrentTenant: true,
  //       }),
  //     ]);
  //     const workList = workData.items.map((i) => {
  //       return {
  //         value: i.userId,
  //         label: i.realName,
  //       };
  //     });
  //     const tenantList = tenantData.items.map((i) => {
  //       return {
  //         value: i.id,
  //         label: i.name,
  //       };
  //     });
  //     setState({
  //       workList,
  //       tenantList,
  //     });
  //   };

  useEffect(() => {
    // getSelectOptions();
    getCallRecordStatisticsApi();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        className="mb-0" // 移除默认的margin-bottom
        tabBarStyle={{ marginBottom: 0, marginLeft: 12 }} // 确保Tab栏下方没有额外间距
      >
        <Tabs.TabPane tab={`已接通(${state.callStats.answerCount})`} key="1" />
        <Tabs.TabPane
          tab={`未接通(${state.callStats.unAnswerCount})`}
          key="2"
        />
        <Tabs.TabPane tab={`拒接(${state.callStats.rejectCount})`} key="4" />
      </Tabs>

      <GenericTable
        search={false}
        columns={columns}
        request={getCallRecords}
        expandButtonProps={(record) => ({
          hideDetailAction: !canViewDetail,
        })}
        key={activeTab}
        className="mt-0 [&_.ant-pro-table-list-toolbar]:hidden"
        style={{ marginTop: 5, marginLeft: -10 }} // 双重保障
      />
    </div>
  );
};

const CallRecords = memo(Component);
export default CallRecords;
