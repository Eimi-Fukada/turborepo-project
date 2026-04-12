"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Card,
  Descriptions,
  Tag,
  Button,
  Table,
  Typography,
  Radio,
  Space,
} from "antd";
import { post } from "@/request";
import { EvaluateQueryDetailResponse } from "./types";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useRouter } from "next/navigation";
const { Text } = Typography;

interface EvaluateModalProps {
  visible: boolean;
  reportId: number;
  onCancel: () => void;
}

const relationMap = {
  1: "本人",
  2: "夫妻",
  3: "父母",
  4: "亲戚",
  5: "朋友",
  6: "其他",
};

const privilegeMap = {
  1: "自主测评",
  2: "视频测评",
  3: "上门测评",
};

const riskLevelMap = {
  10: "高风险",
  15: "中高风险",
  20: "中风险",
  30: "低风险",
};

const columns = [
  {
    title: "评项项目",
    dataIndex: "name",
    key: "name",
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: "得分",
    dataIndex: "score",
    key: "score",
  },
];

const EvaluateModal: React.FC<EvaluateModalProps> = ({
  visible,
  onCancel,
  reportId,
}) => {
  const [state, setState] = useCallBackState<{
    reportDetail: EvaluateQueryDetailResponse;
  }>({
    reportDetail: {
      userReports: [],
    } as unknown as EvaluateQueryDetailResponse,
  });

  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const evaluateDataSource =
    state.reportDetail?.userReports[currentIndex]?.physicalFunction;

  const getEvaluateDetail = () => {
    if (visible && reportId) {
      post("/evaluateQuery/evaluateDetails", { reportId: reportId })
        .then((res) => {
          setState({
            reportDetail: {
              ...res.data,
              userReports: res.data.userReports || [], // 确保 userReports 不为 undefined
            },
          });
          setCurrentIndex(0);
        })
        .catch((err) => {
          console.error("请求失败:", err);
        });
    }
  };

  useEffect(() => {
    getEvaluateDetail();
  }, [visible, reportId]);

  return (
    <Modal
      title="报告详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={780}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={2} title="用户信息" size="small">
            <Descriptions.Item label="权益客户">
              {state.reportDetail.userName}
            </Descriptions.Item>
            <Descriptions.Item label="联系手机号">
              {state.reportDetail.mobile}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={3} title="老人信息" size="small">
            {state.reportDetail?.userReports.map((userReport, index) => (
              <React.Fragment key={index}>
                <Descriptions.Item label="">
                  <Space align="baseline">
                    <Radio
                      checked={currentIndex === index}
                      onChange={() => setCurrentIndex(index)}
                    />
                    <span>姓名: {userReport.userInfo.name}</span>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="">
                  <Space>
                    性别: {userReport.userInfo.gender == 1 ? "男" : "女"}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="">
                  <Space>
                    关系:{" "}
                    {
                      relationMap[
                        userReport.userInfo.relation as keyof typeof relationMap
                      ]
                    }
                  </Space>
                </Descriptions.Item>
              </React.Fragment>
            ))}
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={2} title="测评信息" size="small">
            <Descriptions.Item label="测评类型">
              {privilegeMap[state.reportDetail?.privilegeType]}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color="green">
                {state.reportDetail?.status === 1 ? "待测评" : "已完成"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="完成测评时间">
              {state.reportDetail?.evaluateTime}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0 }}>
          <Descriptions column={3} title="测评项目" size="small">
            <Descriptions.Item label="综合得分">
              <Text
                style={{
                  color: "#1890ff",
                  fontWeight: 600,
                  fontSize: 18,
                  marginTop: -4,
                }}
              >
                {
                  state.reportDetail?.userReports[currentIndex]?.overallRisk
                    ?.score
                }
                分
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="">
              <Tag color="red">
                {state.reportDetail?.userReports?.[currentIndex]?.overallRisk
                  ?.riskLevel
                  ? riskLevelMap[
                      state.reportDetail.userReports[currentIndex].overallRisk
                        .riskLevel as keyof typeof riskLevelMap
                    ]
                  : "未知风险"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="">
              <Button
                color="cyan"
                variant="solid"
                size="small"
                onClick={() => {
                  router.push(
                    `/evaluateList/evaluateDetail?reportId=${reportId}&currentIndex=${currentIndex}`
                  );
                }}
              >
                报告详情
              </Button>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card variant="outlined" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Table
            dataSource={evaluateDataSource}
            columns={columns}
            pagination={false}
            size="small"
            bordered={false}
            rowKey="key"
            style={{ marginBottom: 0 }}
          />
        </Card>
      </Space>
    </Modal>
  );
};

export default EvaluateModal;
