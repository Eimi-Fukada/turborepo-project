"use client";

import { FC, memo, useEffect, useState } from "react";
import { Button, Tabs, Table, Modal, message } from "antd";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/useUserStore";

interface RegisterRecordsProps {
  userId: string;
  canCancel: boolean;
  canViewDetail: boolean;
}

interface RegistrationSummaryResponse {
  pendingNum: number;
  completedNum: number;
  cancelledNum: number;
  missedNum: number;
  failedNum: number;
}

enum RegistrationStateEnum {
  PENDING = 1, // 待就诊
  COMPLETED, // 已就诊
  CANCELED, // 已取消
  MISSED, // 已爽约
  FAILED, // 预约失败
}

const Component: FC<RegisterRecordsProps> = ({
  userId,
  canCancel,
  canViewDetail,
}) => {
  const [state, setState] = useCallBackState<{
    current: number;
    patientInfo: any;
    list: any[];
    ip: string;
  }>({
    current: 1,
    patientInfo: {},
    list: [],
    ip: "",
  });

  const [tabCounts, setTabCounts] = useState<RegistrationSummaryResponse>({
    pendingNum: 0,
    completedNum: 0,
    cancelledNum: 0,
    missedNum: 0,
    failedNum: 0,
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<any>(null);
  const [optionalRecord, setOptionalRecord] = useState<any>(null);

  const getIPAddress = async () => {
    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      setState({ ip: data.ip });
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  };

  const filterPending = (item: any) =>
    !item.reasonMessage &&
    item.isQuit === 0 &&
    (item.isFetched === 0 || item.isFetched === 2) &&
    dayjs().startOf("day").valueOf() <=
      dayjs(item?.clinicDateTime?.split(" ")[0]).valueOf();

  const filterCompleted = (item: any) =>
    !item.reasonMessage &&
    dayjs().startOf("day").valueOf() >
      dayjs(item?.clinicDateTime?.split(" ")[0]).valueOf() &&
    item.isFetched === 1;

  const filterCancelled = (item: any) =>
    !item.reasonMessage && item.isQuit === 1;

  const filterMissed = (item: any) =>
    !item.reasonMessage &&
    dayjs().startOf("day").valueOf() >
      dayjs(item?.clinicDateTime?.split(" ")[0]).valueOf() &&
    item.isFetched === 2;

  const filterFailed = (item: any) =>
    item.reasonMessage != null && item.reasonMessage != "";

  const getAppointmentUserInfo = async () => {
    try {
      const res = await get("/butlerUserService/detail-encrypt", {
        butlerUserId: userId,
      });
      if (!res?.data?.idCard) return;

      const { data } = await post("/reservationService/queryUserAppointment", {
        idCard: res.data.idCard,
      });

      setState({
        patientInfo: data.patientInfo,
        list: data.regInfo || [],
      });

      setTabCounts({
        pendingNum: data.regInfo.filter(filterPending).length,
        completedNum: data.regInfo.filter(filterCompleted).length,
        cancelledNum: data.regInfo.filter(filterCancelled).length,
        missedNum: data.regInfo.filter(filterMissed).length,
        failedNum: data.regInfo.filter(filterFailed).length,
      });
    } catch (error) {
      console.error("获取预约信息失败:", error);
    }
  };

  const handleViewDetail = async (record: any) => {
    setCurrentDetail(record);
    setDetailModalVisible(true);
    try {
      const result = await get("/reservationService/operationRecord", {
        sn: record.sn,
      });
      setOptionalRecord(result.data);
    } catch (error) {
      console.error("获取操作记录失败:", error);
    }
  };

  const handleCancelAppointment = (record: any) => {
    setCurrentDetail(record);
    setCancelModalVisible(true);
  };

  const handleCancel = async () => {
    try {
      const { result, resultMessage } = await post(
        "/reservationService/cancelAppointment",
        {
          patientInfo: {
            idCard: state.patientInfo.idCard,
            name: state.patientInfo.name,
            phone: state.patientInfo.phone,
            insureType: state.patientInfo.insureType,
          },
          sn: currentDetail.sn,
          reqIp: state.ip,
          operateUser: useUserStore.getState().userInfo?.realName,
        }
      );

      if (result === 0) {
        message.success("取消成功");
        await getAppointmentUserInfo();
        setCancelModalVisible(false);
      } else {
        message.error(resultMessage || "取消失败");
      }
    } catch (error) {
      console.error("取消预约失败:", error);
      message.error("取消预约失败");
    }
  };

  useEffect(() => {
    getAppointmentUserInfo();
    getIPAddress();
  }, []);

  const columns = [
    {
      title: "序号",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: "center" as const,
    },
    {
      title: "预约记录ID",
      dataIndex: "sn",
      key: "sn",
      render: (text: string) => text || "-",
      align: "center" as const,
    },
    {
      title: "就诊类型",
      dataIndex: "insureType",
      key: "insureType",
      render: (text: string) => text || "-",
      align: "center" as const,
    },
    {
      title: "挂号类型",
      dataIndex: "doctorName",
      key: "doctorName",
      align: "center" as const,
      render: (text: string) => (text ? "专家号" : "普通号"),
    },
    {
      title: "就诊医院",
      dataIndex: "hospName",
      key: "hospName",
      align: "center" as const,
    },
    {
      title: "就诊科室",
      dataIndex: "departName",
      key: "departName",
      align: "center" as const,
    },
    {
      title: "就诊医生",
      dataIndex: "doctorName",
      key: "doctorName",
      align: "center" as const,
      render: (text: string) => text || "-",
    },
    {
      title: "就诊序号",
      dataIndex: "clinicSN",
      key: "clinicSN",
      align: "center" as const,
      render: (text: string) => text || "-",
    },
    {
      title: "预约时间",
      dataIndex: "regDateTime",
      key: "regDateTime",
      align: "center" as const,
      render: (text: string) => text || "-",
    },
    {
      title: "预计就诊时间",
      dataIndex: "clinicDateTime",
      key: "clinicDateTime",
      align: "center" as const,
      render: (text: string) => text || "-",
    },
    {
      title: "就诊时间",
      dataIndex: "fetchDateTime",
      key: "fetchDateTime",
      align: "center" as const,
      render: (text: string) => text || "-",
      hidden: state.current !== RegistrationStateEnum.CANCELED,
    },
    {
      title: "取消时间",
      dataIndex: "quitTime",
      key: "quitTime",
      align: "center" as const,
      render: (text: string) => text || "-",
      hidden: state.current !== RegistrationStateEnum.CANCELED,
    },
    {
      title: "过期时间",
      dataIndex: "clinicDateTime",
      key: "clinicDateTime",
      align: "center" as const,
      render: (text: string) =>
        dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "-",
      hidden: state.current !== RegistrationStateEnum.MISSED,
    },
    {
      title: "预约途径",
      align: "center" as const,
      dataIndex: "regVia",
      key: "regVia",
      render: (text: string) => text || "-",
    },
    {
      title: "操作",
      align: "center" as const,
      key: "action",
      render: (_, record: any) => (
        <>
          {canViewDetail && (
            <Button type="link" onClick={() => handleViewDetail(record)}>
              查看详情
            </Button>
          )}
          {canCancel && filterPending(record) && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelAppointment(record)}
            >
              取消预约
            </Button>
          )}
        </>
      ),
    },
  ].filter((column) => !column.hidden);

  return (
    <div className="bg-white p-4 rounded shadow">
      <Tabs
        activeKey={state.current.toString()}
        onChange={(key) => setState({ current: parseInt(key) })}
        className="mb-0"
        tabBarStyle={{ marginBottom: 0 }}
      >
        <Tabs.TabPane tab={`待就诊(${tabCounts.pendingNum})`} key="1" />
        <Tabs.TabPane tab={`已就诊(${tabCounts.completedNum})`} key="2" />
        <Tabs.TabPane tab={`已取消(${tabCounts.cancelledNum})`} key="3" />
        <Tabs.TabPane tab={`已爽约(${tabCounts.missedNum})`} key="4" />
        <Tabs.TabPane tab={`预约失败(${tabCounts.failedNum})`} key="5" />
      </Tabs>

      <Table
        dataSource={state.list.filter((item) => {
          switch (state.current) {
            case 1:
              return filterPending(item);
            case 2:
              return filterCompleted(item);
            case 3:
              return filterCancelled(item);
            case 4:
              return filterMissed(item);
            case 5:
              return filterFailed(item);
            default:
              return false;
          }
        })}
        columns={columns}
        rowKey="sn"
        className="mt-0 [&_.ant-pro-table-list-toolbar]:hidden"
        style={{ marginTop: 5, marginLeft: -10 }}
      />

      {/* 保持现有的Modal组件不变 */}
      <Modal
        title="预约详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {currentDetail && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <div className="font-bold mb-2">预约记录ID</div>
              <div>{currentDetail.sn || "-"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">就诊类型</div>
              <div>{currentDetail.insureType || "-"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">挂号类型</div>
              <div>{currentDetail.doctorName ? "专家号" : "普通号"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">就诊医院</div>
              <div>{currentDetail.hospName}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">就诊科室</div>
              <div>{currentDetail.departName}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">就诊医生</div>
              <div>{currentDetail.doctorName || "-"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">预计就诊时间</div>
              <div>{currentDetail.clinicDateTime || "-"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">就诊序号</div>
              <div>{currentDetail.clinicSN || "-"}</div>
            </div>
            <div className="col-span-1">
              <div className="font-bold mb-2">预约途径</div>
              <div>{currentDetail.regVia || "-"}</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="取消预约"
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => setCancelModalVisible(false)}
      >
        <p>确定要取消该预约吗？</p>
      </Modal>
    </div>
  );
};

const RegisterRecords = memo(Component);
RegisterRecords.displayName = "RegisterRecords";

export default RegisterRecords;
