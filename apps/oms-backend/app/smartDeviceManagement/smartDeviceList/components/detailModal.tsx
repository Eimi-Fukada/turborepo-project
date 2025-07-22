"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Card, Descriptions, Table, Typography, Space } from "antd";
import { mapDeviceTypeName } from "@/enums/deviceEnum";
import { get, post } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useRouter } from "next/navigation";
const { Text } = Typography;

interface EvaluateModalProps {
  open: boolean;
  device: any;
  onClose: () => void;
}

const OperationColumn: React.FC<{ deviceCode: string }> = ({ deviceCode }) => {
  const router = useRouter();
  return (
    <Space>
      <a
        onClick={() => {
          router.push(
            `/smartDeviceManagement/alertList?deviceSn=${deviceCode}`
          );
        }}
      >
        查看详情
      </a>
    </Space>
  );
};

const SmartDeviceDetailModal: React.FC<EvaluateModalProps> = ({
  open,
  onClose,
  device,
}) => {
  const columns = useMemo(
    () => [
      {
        title: "报警总次数",
        dataIndex: "alertCount",
        key: "alertCount", // 添加 key
        align: "center" as const,
        render: (text: string) => <Text>{text}</Text>,
      },
      {
        title: "最近报警",
        dataIndex: "lastAlertTime",
        align: "center" as const,
        key: "last_alert", // 添加 key
        render: (text: string) => <Text>{text ?? "无"}</Text>,
      },
      {
        title: "操作",
        key: "operation", // 添加 key
        dataIndex: "operation",
        align: "center" as const,
        render: () => <OperationColumn deviceCode={device.code} />,
      },
    ],
    [device.code]
  );

  const [state, setState] = useCallBackState({
    evaluateDataSource: [] as any,
  });

  const getDeviceAlertInfo = () => {
    if (!device || !device.code) {
      return;
    }

    get("/butlerAlertService/deviceAlertInfo", { deviceSn: device.code })
      .then((res) => {
        setState({
          evaluateDataSource: [{ ...res.data, key: device.code + Date.now() }],
        });
      })
      .catch((err) => {
        console.error("请求失败:", err);
      });
  };

  useEffect(() => {
    getDeviceAlertInfo();
  }, [open]);

  return (
    <Modal
      title="查看详情"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden={true}
      width={780}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={3} title="基本信息" size="small">
            <Descriptions.Item label="硬件名称">
              <Text>{device.name ?? ""}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="硬件设备号">
              {device.code}
            </Descriptions.Item>
            <Descriptions.Item label="设备类型">
              {mapDeviceTypeName(device.type)}
            </Descriptions.Item>
            <Descriptions.Item label="设备来源">
              {device.sourceCode}
            </Descriptions.Item>
            <Descriptions.Item label="设备状态">
              {device.status == 1 ? "在线" : "离线"}
            </Descriptions.Item>
            <Descriptions.Item label="关联用户">
              {device.userName}
            </Descriptions.Item>
            <Descriptions.Item label="所属租户">
              {device.tenantName}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Table
            dataSource={state.evaluateDataSource}
            columns={columns}
            pagination={false}
            size="small"
            bordered={false}
            rowKey="key"
            style={{ marginBottom: 0, textAlign: "center" }}
          />
        </Card>
      </Space>
    </Modal>
  );
};

export default SmartDeviceDetailModal;
