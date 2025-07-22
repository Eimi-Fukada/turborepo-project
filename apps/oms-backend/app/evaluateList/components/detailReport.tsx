"use client";

import {
  getRiskColor,
  getRiskName,
  transformAge,
  transformDate,
} from "@/utils/help";
import { Card, Descriptions, DescriptionsProps, Tag } from "antd";
import { FC, memo } from "react";
import styles from "../evaluateDetail/index.module.css";
import { HouseTypeEnumDesc } from "@/enums/houseTypeEnum";

const Component: FC<{
  currentUserReports: any;
  currentData: any;
}> = ({ currentUserReports, currentData }) => {
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "姓名",
      children: currentUserReports?.userInfo?.name,
    },
    {
      key: "2",
      label: "年龄",
      children: transformAge(
        currentUserReports?.userInfo?.age,
        currentUserReports?.userInfo?.birthday
      ),
    },
    {
      key: "3",
      label: "房型",
      children: HouseTypeEnumDesc[currentData.reportType],
    },
    {
      key: "4",
      label: "测评时间",
      children: transformDate(currentData.reportCreateTime),
    },
    {
      key: "5",
      label: "测评类型",
      children: "自主测评",
    },
    {
      key: "6",
      label: "测评人",
      children: currentData.userName,
    },
  ];

  return (
    <div className="mt-5 flex">
      <div>
        <Descriptions
          bordered
          items={items}
          layout="vertical"
          className={styles.evaluate_descriptions}
          style={{ width: 480, marginBottom: "20px" }}
        />
        <Card
          style={{ width: 480 }}
          hoverable
          title="总体风险评分"
          variant="borderless"
          extra={
            <span
              style={{
                color: getRiskColor(currentUserReports?.overallRisk?.riskLevel),
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {currentUserReports?.overallRisk?.score}分
            </span>
          }
        >
          {currentUserReports?.overallRisk?.riskLines?.map((item) => {
            return (
              <div key={item.name} style={{ marginBottom: "20px" }}>
                <div
                  className="flex justify-between items-center gap-2"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="font-bold text-lg">{item.name}</div>
                  <Tag
                    color={getRiskColor(item.riskLevel)}
                    style={{ borderRadius: "24px" }}
                  >
                    {getRiskName(item.riskLevel)}
                  </Tag>
                </div>
                <div>{item.description}</div>
              </div>
            );
          })}
        </Card>
      </div>
      <div className="flex flex-wrap -mt-[145px]">
        {currentUserReports?.physicalFunction?.map((item) => (
          <Card
            style={{
              width: 480,
              marginBottom: "20px",
              marginLeft: "20px",
            }}
            hoverable
            title={item.name + "评分"}
            variant="borderless"
            key={item.code}
            extra={<span className="text-lg font-bold">{item.score}分</span>}
          >
            {item.physicalFunctionLines
              .filter((i) => !!i.name)
              ?.map((riskItem) => (
                <div
                  className="flex justify-between items-center gap-2 mb-3"
                  key={riskItem.name}
                >
                  <div className="font-bold text-lg">{riskItem.name}</div>
                  <Tag
                    color={riskItem.riskStatus === 2 ? "#28A745" : "#DC3545"}
                    style={{ borderRadius: "24px" }}
                  >
                    {riskItem.riskStatus === 2 ? "无风险" : "有风险"}
                  </Tag>
                </div>
              ))}
            <div className="text-lg font-bold mb-1">{item.name}风险点分析</div>
            {item.analysisInfo?.content?.length > 0 &&
              item.analysisInfo?.content.map((info, _idx) => (
                <div key={_idx}>
                  {_idx + 1}、{info}
                </div>
              ))}
            {item.analysisInfo?.content?.length === 0 && <div>暂无风险点</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

const DetailReport = memo(Component);
export default DetailReport;
