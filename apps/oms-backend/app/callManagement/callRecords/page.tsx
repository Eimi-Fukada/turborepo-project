"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { get, post } from "@/request";
import { useUserStore } from "@/stores/useUserStore";
import { exportFile, formatDuration } from "@/utils/help";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button } from "antd";
import { FC, memo, useEffect } from "react";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const canShowDetail = hasBtnPermission(
    "/callRecords/callRecordsDetail:detail"
  );
  const canExport = hasBtnPermission("/callRecords/callRecords:export");
  const canImport = hasBtnPermission("/callRecords/callRecords:import");

  const [state, setState] = useCallBackState<{
    workList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
  }>({
    workList: [],
    tenantList: [],
  });
  const userInfo = useUserStore((state) => state.userInfo);

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "通话标识",
      dataIndex: "urgentType",
      renderText(text, record, index, action) {
        return <>{record.urgentType === 1 ? "常规" : "告警"}</>;
      },
      search: false,
    },
    {
      title: "通话用户",
      dataIndex: "butlerUserName",
    },
    {
      title: "所属城市",
      dataIndex: "city",
      search: false,
    },
    {
      title: "通话类型",
      dataIndex: "callType",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "", label: "全部" },
          { value: "2", label: "呼出" },
          { value: "1", label: "呼入" },
        ],
      },
      valueEnum: {
        "": { text: "全部", status: "Default" },
        "2": { text: "呼出", status: "Processing" },
        "1": { text: "呼入", status: "Success" },
      },
    },
    {
      title: "通话状态",
      dataIndex: "callStatus",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "", label: "全部" },
          { value: "1", label: "已接通" },
          { value: "2", label: "未接通" },
          { value: "4", label: "拒接" },
        ],
      },
      valueEnum: {
        "": { text: "全部", status: "Default" },
        "1": { text: "已接通", status: "Success" },
        "2": { text: "未接通", status: "Processing" },
        "4": { text: "拒接", status: "Error" },
      },
    },
    {
      title: "呼叫时间",
      dataIndex: "inserttime",
      search: false,
    },
    {
      title: "通话时长",
      dataIndex: "duration",
      search: false,
      renderText: (text, record, index, action) => {
        return <>{formatDuration(record.callStatus, record.duration)}</>;
      },
    },
    {
      title: "触发来源",
      dataIndex: "urgentDeviceType",
      hidden: true,
      search: false,
    },
    {
      title: "硬件设备号",
      dataIndex: "urgentDeviceImei",
      hidden: true,
      search: false,
    },
    {
      title: "硬件名称",
      dataIndex: "urgentDeviceName",
      hidden: true,
      search: false,
    },
    {
      title: "指派管家",
      dataIndex: "username",
      search: false,
      renderText: (text, record, index, action) => {
        return (
          <>{state.workList.find((i) => i.value === record?.userId)?.label}</>
        );
      },
    },
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
  ];

  const getCallRecords = async (params) => {
    const res = await get("/callRecordsService/page", { ...params });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getSelectOptions = async () => {
    const [workData, tenantData] = await Promise.all([
      post("/butlerWorkerService/page", {
        pageSize: 100,
        startPage: 1,
      }),
      post("tenantQuery/tenantOptionList", {
        startPage: 1,
        pageSize: 100,
        includeCurrentTenant: true,
      }),
    ]);
    const workList = workData.items.map((i) => {
      return {
        value: i.userId,
        label: i.realName,
      };
    });
    const tenantList = tenantData.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      workList,
      tenantList,
    });
  };

  const [handleExport, loading] = useSuperLock(async (searchParams) => {
    const res = await get(
      "/callRecordsService/exportCallRecords",
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
    const fileName = `通话记录_${currentDate}_${username}.xlsx`;
    exportFile(fileName, res.data);
  });

  useEffect(() => {
    getSelectOptions();
  }, []);

  return (
    <>
      <GenericTable
        columns={columns}
        request={getCallRecords}
        expandButtonProps={(record) => ({
          hideDetailAction: !canShowDetail,
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
    </>
  );
};

const CallRecords = memo(Component);
export default CallRecords;
