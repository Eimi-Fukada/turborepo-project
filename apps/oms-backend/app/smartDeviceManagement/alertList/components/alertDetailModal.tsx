import React, { useEffect, useState } from "react";
import { Modal, Card, Descriptions, Tag, Space } from "antd";
import { get, post } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { mapAlertStatusName } from "@/enums/alertStatusEnum";
import { mapDeviceTypeName } from "@/enums/deviceEnum";

interface AlertDetailProps {
  visible: boolean;
  alertId: number;
  onCancel: () => void;
  formatDuration: (seconds: number) => string;
}

interface ButlerDeviceAlertResponse {
  id: string;
  tenantId: string;
  tenantName: string;
  butlerUserId: string;
  userName: string;
  gender: number;
  age: number | null;
  phoneNumber: string;
  relation: number;
  city: string | null;
  address: string;
  street: string;
  contactList: any | null; // 可根据实际数据结构替换为具体类型
  alertNo: string;
  alertTime: string;
  alertStatus: number;
  followUpStatus: number;
  deviceSource: string;
  deviceSn: string;
  deviceName: string;
  deviceType: number;
  onlineStatus: any | null; // 可根据实际数据结构替换为具体类型
  handlerUserId: string;
  handlerUserName: string;
  duration: number;
  closeTime: string;
}

interface HandleInfo {
  id: string;
  handleUserName: string | null;
  handleTime: string | null;
  handleDuration: number;
  callRecordId: any | null; // 可根据实际数据结构替换为具体类型
  remark: string;
}

interface ButlerAlertFollowUpResponse {
  id: number | null;
  followUpUserName: string | null;
  planedFollowTime: string | null; // LocalDateTime represented as string (ISO format)
  followUpTime: string | null; // LocalDateTime represented as string (ISO format)
  userFeedBack: string | null;
  callRecordId: number[] | null; // List<Long> in Java becomes number array in TS
}

const AlertDetailModal: React.FC<AlertDetailProps> = ({
  visible,
  onCancel,
  alertId,
  formatDuration,
}) => {
  const [state, setState] = useCallBackState<{
    alertDetail?: ButlerDeviceAlertResponse;
    alertHandleInfo?: HandleInfo;
    alertFollowUpInfo?: ButlerAlertFollowUpResponse;
  }>({
    alertDetail: {} as ButlerDeviceAlertResponse,
    alertHandleInfo: {} as HandleInfo,
    alertFollowUpInfo: {} as ButlerAlertFollowUpResponse,
  });

  const getEvaluateDetail = () => {
    if (!alertId) return;
    get("/butlerAlertService/butlerAlertDetail", { alertId }).then((res) => {
      setState({
        alertDetail: res.data.butlerDeviceAlertResponse,
        alertHandleInfo: res.data.handleInfo,
        alertFollowUpInfo: res.data.followUpInfo,
      });
    });
  };

  useEffect(() => {
    getEvaluateDetail();
  }, [visible, alertId]);

  return (
    <Modal
      title="报警详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={3} title="用户信息" size="small">
            <Descriptions.Item label="用户姓名">
              {state.alertDetail?.userName}
            </Descriptions.Item>
            <Descriptions.Item label="联系方式">
              {state.alertDetail?.userName}
            </Descriptions.Item>
            <Descriptions.Item label="所属城市">
              {state.alertDetail?.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="详细地址">
              {state.alertDetail?.address}
            </Descriptions.Item>
            <Descriptions.Item label="所属租户">
              {state.alertDetail?.tenantName}
            </Descriptions.Item>
            <Descriptions.Item label="所属街道">
              bb{state.alertDetail?.street}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={3} title="报警信息" size="small">
            <Descriptions.Item label="报警工单ID">
              {state.alertDetail?.alertNo}
            </Descriptions.Item>
            <Descriptions.Item label="设备类型">
              {mapDeviceTypeName(state.alertDetail?.deviceType ?? 0)}
            </Descriptions.Item>
            <Descriptions.Item label="设备来源">
              {state.alertDetail?.deviceSource}
            </Descriptions.Item>
            <Descriptions.Item label="硬件名称">
              {state.alertDetail?.deviceName}
            </Descriptions.Item>
            <Descriptions.Item label="硬件设备号">
              {state.alertDetail?.deviceSn}
            </Descriptions.Item>
            <Descriptions.Item label="报警时间">
              {state.alertDetail?.alertTime}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {mapAlertStatusName(state.alertDetail?.alertStatus ?? 0)}
            </Descriptions.Item>
            <Descriptions.Item label="处理人">
              {state.alertDetail?.handlerUserName}
            </Descriptions.Item>
            <Descriptions.Item label="关闭时间">
              {state.alertDetail?.closeTime}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        {state.alertHandleInfo && (
          <Card variant="outlined" style={{ marginBottom: 0 }}>
            <Descriptions column={3} title="处理信息" size="small">
              <Descriptions.Item label="处理时间">
                {state.alertHandleInfo?.handleTime}
              </Descriptions.Item>
              <Descriptions.Item label="处理时长">
                {formatDuration(state.alertHandleInfo?.handleDuration || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="处理通话记录">
                {state.alertHandleInfo?.callRecordId}
              </Descriptions.Item>
              <Descriptions.Item label="处理进度">
                {state.alertHandleInfo?.remark}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
        {state.alertFollowUpInfo && (
          <Card variant="outlined" style={{ marginBottom: 0 }}>
            <Descriptions column={3} title="回访信息" size="small">
              <Descriptions.Item label="预计回访时间">
                {state.alertFollowUpInfo?.planedFollowTime}
              </Descriptions.Item>
              <Descriptions.Item label="回访通话记录">
                {state.alertFollowUpInfo?.callRecordId}
              </Descriptions.Item>
              <Descriptions.Item label="回访说明">
                {state.alertFollowUpInfo?.userFeedBack}
              </Descriptions.Item>
              <Descriptions.Item label="完成回访时间">
                {state.alertFollowUpInfo?.followUpTime}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default AlertDetailModal;
