"use client";

import React, { memo, useMemo } from "react";
import styles from "./index.module.css";
// import UserBaseInfo from "../UserBaseInfo/UserBaseInfo";
// import HealthArchives from "../HealthArchives/HealthArchives";
// import Contacts from "../Contacts/Contacts";
import { UserInfo } from "../../workbenchDetail/const";
import Icon1 from "./images/icon_user.png";
import UserBaseInfo from "../userBaseInfo";
import HealthArchives from "../healthArchives";
import Contacts from "../contacts";

interface UserRecordProps {
  userInfo: UserInfo;
}

const UserRecord: React.FC<UserRecordProps> = ({ userInfo }) => {
  // 计算 archives
  const archives = useMemo(() => {
    return {
      ...(userInfo?.archives || {}),
      butlerUserId: userInfo?.id,
    };
  }, [userInfo]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src={Icon1.src} className={styles.icon} />
        <div className={styles.text}>用户信息</div>
      </div>
      <div className={styles.content}>
        <div style={{ marginBottom: 24 }}>
          <UserBaseInfo userInfo={userInfo} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <HealthArchives archives={archives || {}} />
        </div>
        <Contacts
          contacts={userInfo?.contacts || []}
          butlerUserId={userInfo?.id || ""}
        />
      </div>
    </div>
  );
};

export default memo(UserRecord);
