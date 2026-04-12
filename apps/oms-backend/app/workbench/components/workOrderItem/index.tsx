"use client";

import React from "react";
import dayjs from "dayjs";
import styles from "./index.module.css";
import { WorkOrderItemInfo } from "../workOrderRecord/const";
import { DeviceTypeOptions } from "@/enums/deviceEnum";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { formatDurationToTime } from "@/utils/help";
import { Button } from "antd";
import { hasBtnPermission } from "@/utils/permission";

interface WorkOrderItemProps {
  data: WorkOrderItemInfo;
  onClick?: (data) => void;
}

const WorkOrderItem: React.FC<WorkOrderItemProps> = ({ data, onClick }) => {
  const canFollowUp = hasBtnPermission("butlerWorkbench:followUp");

  return (
    <div
      className={styles.page}
      style={data.alertStatus === 2 ? {} : { paddingBottom: 0 }}
    >
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className={styles.line}></div>
          <div className={styles.text}>工单ID：{data.id}</div>
        </div>
        <div className={styles.status}>
          {DeviceTypeOptions[data.deviceType]?.label}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>姓名：</div>
        <div className={styles.info}>{data.userName}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>性别：</div>
        <div className={styles.info}>{mapGenderName(data.gender)}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>年龄：</div>
        <div className={styles.info}>{data.age || "-"}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>联系方式：</div>
        <div className={styles.info}>
          ({mapRelationName(data.relation)}){data.phoneNumber}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>紧急联系人：</div>
        <div className={styles.info}>
          {data.contactList
            ?.map((i) => {
              return (
                <div key={i.id}>
                  ({mapRelationName(i.relation)}){i.phone}
                </div>
              );
            })
            .join(",") || "-"}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>地址：</div>
        <div className={styles.info}>{data.address}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>硬件名称：</div>
        <div className={styles.info}>{data.deviceName || "-"}</div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>报警时间：</div>
        <div className={styles.info} style={{ color: "red" }}>
          {dayjs(data.alertTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.label}>硬件设备号：</div>
        <div className={styles.info}>{data.deviceSn || "-"}</div>
      </div>
      {data.alertStatus !== 0 && (
        <div className={styles.flex}>
          <div className={styles.label}>处理时长 ：</div>
          <div className={styles.info}>
            {formatDurationToTime(data.duration)}
          </div>
        </div>
      )}
      {data.alertStatus !== 0 && (
        <div className={styles.flex}>
          <div className={styles.label}>处理时间 ：</div>
          <div className={styles.info}>{data.handleTime || "-"}</div>
        </div>
      )}
      {data.alertStatus !== 0 && (
        <div className={styles.flex}>
          <div className={styles.label}>处理通话记录 ：</div>
          <div className={styles.info}>
            {data.handleCallRecordId?.join(",") || "-"}
          </div>
        </div>
      )}
      {data.alertStatus !== 0 && (
        <div className={styles.flex}>
          <div className={styles.label}>处理说明 ：</div>
          <div className={styles.info}>{data.remark || "-"}</div>
        </div>
      )}
      {data.alertStatus !== 0 && (
        <div className={styles.flex}>
          <div className={styles.label}>预计回访时间 ：</div>
          <div className={styles.info}>
            {data.plannedFollowUpNotifyTime || "-"}
          </div>
        </div>
      )}
      {data.alertStatus === 2 && (
        <div className={styles.flex}>
          <div className={styles.label}>回访通话记录 ：</div>
          <div className={styles.info}>
            {data.followUpCallRecordId?.join(",") || "-"}
          </div>
        </div>
      )}
      {data.alertStatus === 2 && (
        <div className={styles.flex}>
          <div className={styles.label}>回访说明 ：</div>
          <div className={styles.info}>{data.userFeedback || "-"}</div>
        </div>
      )}
      {data.alertStatus === 2 && (
        <div className={styles.flex}>
          <div className={styles.label}>完成回访时间 ：</div>
          <div className={styles.info}>{data.actualFollowUpTime || "-"}</div>
        </div>
      )}
      <div className={styles.flex}>
        <div className={styles.label}>处理人：</div>
        <div className={styles.info}>{data.handlerUserName || "-"}</div>
      </div>
      {data.alertStatus !== 2 && canFollowUp && (
        <div className="flex justify-end items-center border-t border-[#E9EBEF] h-[52px] mt-[12px]">
          <Button type="primary" onClick={() => onClick && onClick(data)}>
            {data.alertStatus === 0 ? "立即处理" : "立即回访"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkOrderItem;
