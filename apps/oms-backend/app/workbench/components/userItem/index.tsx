"use client";

import { FC, memo, useMemo } from "react";
import Image from "next/image";
import styles from "./index.module.css";
import icon1 from "./images/icon1.png";
import icon2 from "./images/icon2.png";
import icon3 from "./images/icon3.png";
import icon4 from "./images/icon4.png";
import icon5 from "./images/icon5.png";
import icon6 from "./images/icon6.png";
import dayjs from "dayjs";
import { Badge, Tooltip } from "antd";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { useRouter } from "next/navigation";

export interface UserItemInfo {
  age: number;
  avatar: string;
  butlerUserId: number;
  deviceSn: string;
  deviceStatus: number;
  // 性别 0-未知 1-男 2-女
  gender: number;
  lastCallDate: string;
  tenantId: number;
  tenantName: string;
  tenantType: number;
  tenantTypeName: string;
  userName: string;
  weekActiveCount: number;
  phoneNumber: string;
  phoneRelation: number;
  unhandleAlertCount: number;
}

interface UserItemProps {
  userInfo: UserItemInfo;
}
const Component: FC<UserItemProps> = ({ userInfo }) => {
  const router = useRouter();
  // 计算距离上次通话天数
  const dayAmount = useMemo(() => {
    if (!userInfo.lastCallDate) return undefined;
    return dayjs().diff(dayjs(userInfo.lastCallDate), "day");
  }, [userInfo.lastCallDate]);

  // 性别图标
  const getGenderIcon = () => {
    if (userInfo.gender === 0) {
      return icon6;
    } else if (userInfo.gender === 1) {
      return icon5;
    } else {
      return icon1;
    }
  };

  const handleNavigationItem = (id: number) => {
    router.push(`/workbench/workbenchDetail?id=${id}`);
  };

  return (
    <div
      className={styles.page}
      onClick={() => handleNavigationItem(userInfo.butlerUserId)}
    >
      <div className={styles.header}>
        <Badge
          count={userInfo.unhandleAlertCount}
          offset={[-16, 70]}
          showZero={false}
        >
          <Image
            src={userInfo.avatar || "/avatar.jpg"}
            className={styles.avatar}
            width={52}
            height={52}
            alt="avatar"
          />
        </Badge>
        <div style={{ width: 200 }}>
          <div
            className={styles.flex}
            style={{ marginBottom: 8, justifyContent: "space-between" }}
          >
            <Tooltip title={userInfo.userName} placement="top">
              <div className={styles.name}>{userInfo.userName}</div>
            </Tooltip>
            <div className={styles.flex}>
              <div
                className={styles.tag}
                style={{
                  backgroundColor:
                    userInfo.deviceStatus === 1 ? "#21B748" : "#757880",
                }}
              ></div>
              <div
                className={styles.status}
                style={{
                  color: userInfo.deviceStatus === 1 ? "#21B748" : "#757880",
                }}
              >
                {userInfo.deviceStatus === 1 ? "音箱在线" : "音箱离线"}
              </div>
            </div>
          </div>
          <div className={styles.flex} style={{ marginBottom: 6 }}>
            <div className={styles.flex_item}>
              <Image
                src={getGenderIcon()}
                className={styles.icon}
                width={16}
                height={16}
                alt="gender"
              />
              <div className={styles.text}>
                {mapGenderName(userInfo.gender)}
              </div>
            </div>
            <div className={styles.flex_item}>
              <Image
                src={icon2}
                className={styles.icon}
                width={16}
                height={16}
                alt="age"
              />
              <div className={styles.text}>
                {userInfo.age ? `${userInfo.age}岁` : "-"}
              </div>
            </div>
            <div className={styles.flex_item}>
              <Image
                src={icon3}
                className={styles.icon}
                width={16}
                height={16}
                alt="tenant"
              />
              <div className={styles.text}>{userInfo.tenantName}</div>
            </div>
          </div>
          <div className={styles.flex}>
            <Image
              src={icon4}
              className={styles.icon}
              width={16}
              height={16}
              alt="phone"
            />
            <div className={styles.text}>
              ({mapRelationName(userInfo.phoneRelation)})
              {userInfo.phoneNumber || "未知"}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        {userInfo.lastCallDate ? (
          <div className={styles.left_footer}>
            {dayAmount && dayAmount > 0 ? (
              <span style={{ color: "#0d6efd" }}>{dayAmount}天前</span>
            ) : (
              <span style={{ color: "#0d6efd" }}>今天</span>
            )}
            通话过
          </div>
        ) : (
          <div className={styles.left_footer1}>一直未沟通</div>
        )}
      </div>
    </div>
  );
};

const UserItem = memo(Component);
export default UserItem;
