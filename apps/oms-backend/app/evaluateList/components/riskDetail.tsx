"use client";
import { getRiskColor } from "@/utils/help";
import { Card, Image } from "antd";
import { FC, memo } from "react";
import warn from "../images/warn.webp";
import styles from "../evaluateDetail/index.module.css";
const Component: FC<{
  currentUserReports: any;
}> = ({ currentUserReports }) => {
  const tagPoints = [
    {
      code: "PF",
      points: [],
    },
    {
      code: "OE",
      points: [
        {
          name: "内侧门距",
          text: "门间距狭窄",
          top: "38%",
          left: "49.5%",
        },
        {
          name: "门把手",
          text: "门把手难操作",
          top: "47.5%",
          left: "59%",
        },
        {
          name: "电线分布",
          text: "电线外漏",
          top: "49.2%",
          left: "10%",
        },
        {
          name: "屋内过道",
          text: "过道不通畅",
          top: "58.5%",
          left: "36.5%",
        },
        {
          name: "地面高低差",
          text: "地面高低差",
          top: "87.5%",
          left: "26%",
        },
      ],
    },
    {
      code: "LD",
      points: [
        {
          name: "沙发",
          text: "沙发高度不适宜",
          top: "62%",
          left: "62%",
        },
        {
          name: "座椅",
          text: "座椅缺少扶手",
          top: "66%",
          left: "36%",
        },
        {
          name: "家具边缘",
          text: "家具边角尖锐",
          top: "75%",
          left: "69%",
          isLeft: true,
        },
        {
          name: "地毯",
          text: "易滑动的地毯或地垫",
          top: "80%",
          left: "10%",
        },
        {
          name: "家具防滑",
          text: "座椅易滑动",
          top: "90%",
          left: "48%",
        },
      ],
    },
    {
      code: "BE",
      points: [
        {
          name: "卧室光照度",
          text: "卧室起居光照不足",
          top: "8%",
          left: "34%",
        },
        {
          name: "衣柜",
          text: "柜体无固定易倾倒",
          top: "36%",
          left: "39%",
        },
        {
          name: "开关",
          text: "夜间找寻开关困难",
          top: "48%",
          left: "14%",
        },
        {
          name: "床垫",
          text: "无防坠床措施",
          top: "62%",
          left: "10%",
        },
        {
          name: "过道照明",
          text: "起夜光照不足",
          top: "57%",
          left: "60.5%",
        },
        {
          name: "床高度",
          text: "床沿高度不合适",
          top: "76%",
          left: "24%",
        },
      ],
    },
    {
      code: "KE",
      points: [
        {
          name: "防水垫",
          text: "地面湿滑",
          top: "83%",
          left: "30%",
        },
        {
          name: "烟雾报警",
          text: "无烟雾报警",
          top: "14%",
          left: "54%",
          isLeft: true,
        },
        {
          name: "燃气报警",
          text: "无燃气报警",
          top: "2%",
          left: "17%",
        },
      ],
    },
    {
      code: "BT",
      points: [
        {
          name: "潮湿度",
          text: "卫生间湿度过大",
          top: "10%",
          left: "8%",
        },
        {
          name: "干湿分离",
          text: "地面无干湿分离",
          top: "20%",
          left: "38%",
        },
        {
          name: "淋浴区扶手",
          text: "淋浴区无扶手助力",
          top: "43%",
          left: "22%",
        },
        {
          name: "插座",
          text: "插座电源无防水",
          top: "47%",
          left: "64%",
        },
        {
          name: "如厕扶手",
          text: "如厕无助力扶手",
          top: "59%",
          left: "47%",
        },
        {
          name: "淋浴座椅",
          text: "淋浴区无座椅",
          top: "62%",
          left: "7%",
        },
        {
          name: "如厕设备",
          text: "如厕设备不适宜",
          top: "74%",
          left: "58%",
        },
        {
          name: "淋浴区地面",
          text: "淋浴区地面光滑",
          top: "86%",
          left: "18%",
        },
      ],
    },
  ];
  const riskTagPointList = (riskTagPoints) => {
    const riskTags = riskTagPoints.map((item: any) => item.text);
    return tagPoints.map((i) => {
      return {
        ...i,
        points: i.points.filter((j) => riskTags?.includes(j.text)),
      };
    });
  };

  return (
    <div className="flex flex-wrap mt-5">
      {currentUserReports?.physicalFunction?.map((item, index) => (
        <Card
          key={index}
          style={{ width: 480, marginRight: "20px", marginBottom: "20px" }}
          hoverable
          title={item.name}
          variant="borderless"
          extra={
            <span
              style={{
                color: getRiskColor(item.riskLevel),
              }}
              className="font-bold text-lg"
            >
              {item.score}分
            </span>
          }
        >
          <div className="relative">
            <Image
              src={item.moduleImageUrl}
              alt=""
              width={440}
              className="rounded-xl"
              preview={false}
            />
            {item.code !== "PF" &&
              riskTagPointList(item.riskDetail.riskTagPoints || [])
                ?.find((i) => i.code === item.code)
                ?.points.map((point, idx) => (
                  <div
                    key={idx}
                    className="absolute flex items-center"
                    style={{ top: point.top, left: point.left }}
                  >
                    {point.isLeft && (
                      <div className={styles.text}>{point.name}</div>
                    )}
                    <Image
                      src={warn.src}
                      preview={false}
                      width={24}
                      className={point.isLeft ? styles.icon_left : styles.icon}
                    />
                    {!point.isLeft && (
                      <div className={styles.text}>{point.name}</div>
                    )}
                  </div>
                ))}
          </div>
          <div className="font-bold text-lg mb-2 mt-2">风险点分析</div>
          <div>{item.riskDetail.riskDetailText || "无风险点!"}</div>
        </Card>
      ))}
    </div>
  );
};

const RiskDetail = memo(Component);
export default RiskDetail;
