"use client";
import { FC, memo } from "react";
import EmptyRisk from "../images/emptyRisk.webp";
import warn from "../images/warn.webp";
import { Card, Image } from "antd";
import styles from "../evaluateDetail/index.module.css";

const Component: FC<{
  data: any;
}> = ({ data }) => {
  const isEmpty =
    data
      ?.filter((i) => i.code !== "PF")
      .filter((item) => item.riskDetail.riskTagPoints?.length > 0)?.length ===
    0;
  return (
    <>
      {!isEmpty && (
        <div className="flex flex-wrap">
          {data
            .filter((i) => i.code !== "PF")
            .map((item, index) => (
              <Card
                key={index}
                style={{
                  width: 480,
                  marginRight: "20px",
                  marginBottom: "20px",
                }}
                hoverable
                variant="borderless"
                title={item.name + "改造"}
              >
                {item.riskDetail.riskTagPoints?.map((riskItem, idx) => (
                  <div className="mb-4" key={idx}>
                    <div key={idx} className="flex items-center mb-2">
                      <Image
                        src={warn.src}
                        style={{ width: "20px", marginRight: "4px" }}
                      />
                      <div className="font-bold text-lg">{riskItem.text}</div>
                    </div>
                    {riskItem.tip && <div>{riskItem.tip}</div>}
                    {riskItem.suggestItems?.map((_i, _idx) => (
                      <div key={_idx} className={styles.suggestItem}>
                        <div className={styles.tip}> 小贴士 </div>
                        <Image
                          src={_i.imageUrl}
                          style={{ width: "56px", borderRadius: "8px" }}
                        />
                        <div className={styles.right}>
                          <div>{_i.name}</div>
                          <div className={styles.info}>
                            {" "}
                            功能：{_i.description}{" "}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            ))}
        </div>
      )}
      {isEmpty && (
        <div className="flex items-center flex-col">
          <Image src={EmptyRisk.src} />
          <div className="mb-5">
            根据您所填信息分析，您的居家环境不存在安全风险。
          </div>
          <div style={{ width: "50%", textAlign: "center" }}>
            本次测评的风险主要来自居家老人身体功能部分。除了要加强环境风险因素管理来降低跌倒风险的发生外，还需多关注老人的身体状况。可通过专业的身体活动能力评估或专业的医疗机构评估后，按照评估结果，结合医生或专业人员的指导建议进行预防跌倒风险发生。
          </div>
        </div>
      )}
    </>
  );
};

const EnvironmentImprove = memo(Component);
export default EnvironmentImprove;
