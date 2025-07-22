"use client";

import { FC, memo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Descriptions, Tabs } from "antd";
import { useCallBackState } from "@/hooks/useCallBackState";
import { post } from "@/request";
import { SwapOutlined } from "@ant-design/icons";
import { transformAge } from "@/utils/help";
import DetailReport from "../components/detailReport";
import RiskDetail from "../components/riskDetail";
import EnvironmentImprove from "../components/environmentImprove";

const Component: FC = () => {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const currentIndex = +(searchParams.get("currentIndex") || "0");

  const tabItems = [
    {
      key: "0",
      label: `详细报告`,
    },
    {
      key: "1",
      label: `风险点标注`,
    },
    {
      key: "2",
      label: `解决方案`,
    },
  ];

  const [state, setState] = useCallBackState({
    activeKey: "0",
    current: currentIndex,
    userReports: {} as any,
    data: {} as any,
    riskData: {} as any,
    environmentImproveData: {} as any,
  });

  const getReportDetail = async () => {
    const { data } = await post("/evaluateQuery/evaluateDetails", {
      reportId: reportId,
    });
    const { userReports, ...extraData } = data;
    setState({
      userReports: data?.userReports,
      data: extraData,
    });
  };

  const getRiskDetail = async () => {
    const { data } = await post("/evaluateQuery/reportRiskPoint", {
      reportId: reportId,
    });
    setState({
      riskData: data?.userReports,
    });
  };

  const getEnvironmentImprove = async () => {
    const { data } = await post("/evaluateQuery/reportRiskSuggest", {
      reportId: reportId,
    });
    setState({
      environmentImproveData: data?.physicalFunction,
    });
  };

  const handleSwitch = () => {
    setState({
      current: +!state.current,
    });
  };

  useEffect(() => {
    getReportDetail();
    getRiskDetail();
    getEnvironmentImprove();
  }, []);

  return (
    <>
      <Tabs
        activeKey={state.activeKey}
        onChange={(activeKey) => {
          setState({ activeKey });
        }}
        items={tabItems}
      />
      {state.activeKey !== "2" && (
        <Card
          hoverable
          style={{ width: 480 }}
          title={state.userReports[state.current]?.userInfo?.name}
          variant="borderless"
          extra={
            state.data?.userNum !== 1 ? (
              <SwapOutlined
                style={{ cursor: "pointer" }}
                onClick={() => handleSwitch()}
              />
            ) : null
          }
        >
          <Descriptions>
            <Descriptions.Item label="性别">
              {state.userReports[state.current]?.userInfo?.gender === 1
                ? "男"
                : "女"}
            </Descriptions.Item>
            <Descriptions.Item label="年龄">
              {transformAge(
                state.userReports[state.current]?.userInfo?.age,
                state.userReports[state.current]?.userInfo?.birthday
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      {state.activeKey === "0" && (
        <DetailReport
          currentData={state.data}
          currentUserReports={state.userReports[state.current]}
        />
      )}
      {state.activeKey === "1" && (
        <RiskDetail currentUserReports={state.riskData[state.current]} />
      )}
      {state.activeKey === "2" && (
        <EnvironmentImprove data={state.environmentImproveData} />
      )}
    </>
  );
};

const EvaluateDetail = memo(Component);
export default EvaluateDetail;
