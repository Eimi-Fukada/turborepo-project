"use client";

import { FC, memo } from "react";
import styles from "./index.module.css";
import IconOrder from "./svg/svg_order";
import IconRecords from "./svg/svg_records";
import IconUser from "./svg/svg_user";
import { hasBtnPermission } from "@/utils/permission";

const SliderBar: FC<{
  currentIndex: number;
  onChange: (index: number) => void;
}> = ({ currentIndex, onChange }) => {
  const canUserInfo = hasBtnPermission("butlerWorkbench:userInformation");
  const canAlarmOrder = hasBtnPermission("butlerWorkbench:alarmOrder");
  const canCallLog = hasBtnPermission("butlerWorkbench:callLog");

  const btnArray = [
    ...(canUserInfo ? [{ icon: IconUser, text: "用户信息" }] : []),
    ...(canAlarmOrder ? [{ icon: IconOrder, text: "工单记录" }] : []),
    ...(canCallLog ? [{ icon: IconRecords, text: "通话记录" }] : []),
  ];

  return (
    <div className={styles.page}>
      {btnArray.map((item, index) => {
        const Icon = item.icon;
        const isActive = currentIndex === index;
        return (
          <div
            className={styles.item}
            key={item.text}
            onClick={() => onChange(currentIndex === index ? -1 : index)}
          >
            {isActive && (
              <div
                className={`${styles.line} animate__animated animate__fadeIn`}
              />
            )}
            <div
              className={styles.icon_content}
              style={{
                background: isActive ? "#CFDFFF" : "#e9ebef",
              }}
            >
              <Icon size={36} color={isActive ? "#0D6EFD" : "#757880"} />
            </div>
            <div
              className={styles.item_text}
              style={{
                color: isActive ? "#0D6EFD" : "#757880",
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(SliderBar);
