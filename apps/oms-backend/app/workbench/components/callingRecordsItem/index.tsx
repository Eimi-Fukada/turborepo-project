"use client";

import React from "react";
import dayjs from "dayjs";
import styles from "./index.module.css";
import { formatDurationForCalling } from "@/utils/help";
import {
  CallingRecordsInfo,
  CallingStatusEnumDesc,
} from "../callingRecords/const";

interface CallingRecordsItemProps {
  data: CallingRecordsInfo;
}

const CallingRecordsItem: React.FC<CallingRecordsItemProps> = ({ data }) => {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className={styles.line}></div>
          <div className={styles.text}>ID：{data.id}</div>
        </div>
        <div
          className={styles.status}
          style={
            data.urgentType === 1
              ? {}
              : { background: "rgba(220,53,69,0.12)", color: "#DC3545" }
          }
        >
          {data.urgentType === 1 ? "日常" : "报警"}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>通话类型：</div>
        <div className={styles.info}>
          {data.callType === 1 ? "呼出" : "呼入"}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>通话时长：</div>
        <div className={styles.info}>
          {formatDurationForCalling(data.duration)}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>呼叫状态：</div>
        <div className={styles.info}>
          {CallingStatusEnumDesc[data.callStatus]}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>触发来源：</div>
        <div className={styles.info}>{data.urgentDeviceType || "-"}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>硬件名称：</div>
        <div className={styles.info}>{data.urgentDeviceName || "-"}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>硬件设备号：</div>
        <div className={styles.info}>{data.urgentDeviceImei || "-"}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>指派管家：</div>
        <div className={styles.info}>{data.username}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>呼叫时间：</div>
        <div className={styles.info}>
          {dayjs(data.callStartTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </div>
    </div>
  );
};

export default CallingRecordsItem;
