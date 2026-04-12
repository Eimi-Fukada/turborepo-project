"use client";

import { memo, FC } from "react";
import styles from "./index.module.css";
import { CallTypeEnum } from "@/enums/webrtcEnum";
import { useWebRTC } from "@/stores/useWebRtc";
import { mapGenderName } from "@/enums/genderEnum";

interface UserInfo {
  id: string;
  userName: string;
  gender: number;
  age: number;
  tenantName: string;
  avatar: string;
}

interface BellRingModalProps {
  userInfo: UserInfo;
  open: boolean;
  onAnswerCall: () => void;
  onRejectIncomingCall: () => void;
}

const BellRingModal: FC<BellRingModalProps> = ({
  userInfo,
  open,
  onAnswerCall,
  onRejectIncomingCall,
}) => {
  const { webrtcState } = useWebRTC();
  const isWarningBell = webrtcState?.type === CallTypeEnum.EMERGENCY;

  if (!open) return null;

  return (
    <div>
      <div
        className={[
          isWarningBell ? styles.warning_page_wrapper : styles.page_wrapper,
          "animate__animated animate__bounceInDown",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.flex}>
          <img
            src={userInfo.avatar || "/avatar.jpg"}
            className={styles.avatar}
            alt="avatar"
          />
          <div>
            <div className={styles.flex}>
              <div className={styles.name}>{userInfo.userName}</div>
              <div className={isWarningBell ? styles.warning_tag : styles.tag}>
                {isWarningBell ? "报警" : "日常"}
              </div>
            </div>
            <div className={styles.flex} style={{ marginTop: 4 }}>
              <div className={styles.info}>
                {mapGenderName(userInfo.gender)}
              </div>
              <div className={styles.info}>{userInfo.age}岁</div>
              <div className={styles.info}>{userInfo.tenantName}</div>
            </div>
            <div className={styles.text}>等待接听...</div>
          </div>
        </div>
        <div className={styles.flex}>
          <div
            className={styles.item}
            style={{ marginRight: 32 }}
            onClick={onRejectIncomingCall}
          >
            <div className={styles.icon_box}>
              {/* 拒接图标 */}
              <img
                src="/icons/icon_guaduan.svg"
                alt="拒接"
                width={24}
                height={24}
              />
            </div>
            <div className={styles.icon_text}>拒接</div>
          </div>
          <div className={styles.item} onClick={onAnswerCall}>
            <div
              className={styles.icon_box}
              style={{ backgroundColor: "#21b748", color: "#fff" }}
            >
              {/* 接听图标 */}
              <img
                src="/icons/icon_jieting.svg"
                alt="接听"
                width={24}
                height={24}
              />
            </div>
            <div className={styles.icon_text}>接听</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BellRingModal);
