"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, App, Image } from "antd";
import { UserInfo } from "../../workbenchDetail/const";
import styles from "./index.module.css";
import { useWebRTC } from "@/stores/useWebRtc";
import {
  CallMode,
  CallReasonEnum,
  CallStatusEnum,
  LoginStatusEnum,
} from "@/enums/webrtcEnum";
import { useMethodStore } from "@/stores/useMethodStore";
import { post } from "@/request";
import { CallType } from "@baidu/call-rtcsdk";
import icon1 from "./images/icon1.png";
import icon2 from "./images/icon2.png";
import { hasBtnPermission } from "@/utils/permission";

interface VideoCallProps {
  userInfo: UserInfo;
}

const VideoCall: React.FC<VideoCallProps> = ({ userInfo }) => {
  const { message } = App.useApp();
  const [isVideo, setIsVideo] = useState(true);
  const [isMuteAudio, setIsMuteAudio] = useState(false);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const canCall = hasBtnPermission("butlerWorkbench:callNow");
  // hooks
  const {
    webrtcState,
    setWebrtcState,
    setCallState,
    callState,
    eventState,
    setEventState,
  } = useWebRTC();
  const { triggerMethod } = useMethodStore();

  // 当前坐席信息
  const agentInfo = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("currentAgent") || "{}");
      } catch {
        return {};
      }
    }
    return {};
  }, []);

  // 格式化时间
  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [elapsedMilliseconds]);

  // 是否呼叫中
  const isCalling = useMemo(() => {
    return (
      (callState.state === CallStatusEnum.calling &&
        eventState.clickEventMark) ||
      (callState.state === CallStatusEnum.calling &&
        eventState.onIncomingCallEventMark)
    );
  }, [callState.state, eventState]);

  // 拨打电话
  const handleCallUser = async () => {
    const { data } = await post("/butlerUserService/callInfo", {
      deviceSn: userInfo?.deviceSn,
    });
    const toCaller = {
      uid: Number(data.uid),
      uname: data.name,
      uri: Number(data.uri),
      avatar: data.avatar,
    };
    webrtcState.acspRtc?.makeCall(
      webrtcState.callerInfo,
      toCaller,
      CallMode.AUDIO_VIDEO,
      CallType.service
    );
    const callRecordData = {
      agentId: webrtcState.agentId,
      callType: 2,
      urgentType: 1,
      uri: data.uri,
    };
    const res = await post("/callRecordsService/save", callRecordData);
    setWebrtcState({
      callRecordId: res.data,
    });
    setEventState({
      clickEventMark: true,
      onIncomingCallEventMark: eventState.onIncomingCallEventMark,
    });
  };

  // 挂断电话
  const dropCallUser = () => {
    setCallState({
      state: CallStatusEnum.end,
      reason: CallReasonEnum.localCancel,
    });
    webrtcState.acspRtc?.dropCall("CANCEL");
  };

  // 拨打按钮
  const handleCall = () => {
    if (userInfo.deviceStatus === 2) {
      message.warning("当前用户设备已离线，请先联系用户将设备通电联网");
      return;
    }
    if (webrtcState.loginStatus !== LoginStatusEnum.onLine) {
      triggerMethod("handelOnAndOffline");
      return;
    }
    handleCallUser();
  };

  // 静音
  const handleMuteAudio = () => {
    if (callState.state === CallStatusEnum.talking) {
      setIsMuteAudio((prev) => {
        webrtcState.acspRtc?.muteAudio(!prev);
        return !prev;
      });
    } else {
      message.warning("当前通话状态不支持静音");
    }
  };

  // 切换音视频
  const handleChangCallMode = () => {
    if (callState.state === CallStatusEnum.talking) {
      if (isVideo) {
        webrtcState.acspRtc?.changeCallMode(CallMode.AUDIO_ONLY);
      } else {
        webrtcState.acspRtc?.changeCallMode(CallMode.AUDIO_VIDEO);
      }
      setIsVideo((v) => !v);
    } else {
      message.warning("当前通话状态不支持切换");
    }
  };

  // 通话计时
  useEffect(() => {
    if (callState.state === CallStatusEnum.talking) {
      const id = setInterval(() => {
        setElapsedMilliseconds((ms) => ms + 1000);
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      setElapsedMilliseconds(0);
      if (intervalId) clearInterval(intervalId);
    }
  }, [callState.state]);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        {/* 计时器 */}
        {callState.state === CallStatusEnum.talking && (
          <div className={styles.timer_wrap}>
            <Image
              preview={false}
              src={icon2.src}
              width={16}
              className={styles.time_icon}
              alt="计时"
            />
            <div className={styles.time_text}>{formattedTime}</div>
          </div>
        )}
        {/* 对方视频流 */}
        {callState.state === CallStatusEnum.talking && (
          <div id="peerVideo" className={styles.peerVideo}></div>
        )}
        {/* 本地视频流 */}
        <div id="localVideo" className={styles.localVideo}>
          <div
            className={styles.localVideo_wrap}
            style={isMuteAudio ? { background: "rgba(0,0,0,0.5)" } : {}}
          >
            {isMuteAudio ? (
              <img src="/icons/icon_mute_disabled.svg" width={16} alt="挂断" />
            ) : (
              <img src="/icons/icon_mute.svg" width={16} alt="未静音" />
            )}
          </div>
        </div>
        {/* 静音时头像 */}
        {callState.state === CallStatusEnum.talking && !isVideo && (
          <div className={styles.mute_content}>
            <Image
              src={icon1.src}
              preview={false}
              width={16}
              height={16}
              alt="静音"
            />
            <div className={styles.mute_text}>{agentInfo.name}</div>
          </div>
        )}
        {/* 未通话时头像 */}
        {callState.state !== CallStatusEnum.talking && (
          <div className={styles.avatar_wrap}>
            <Image
              preview={false}
              width={140}
              height={140}
              src={userInfo.avatar || "/avatar.jpg"}
              className={`${styles.avatar} ${isCalling ? styles.ripple_effect : ""}`}
              alt="头像"
            />
            {isCalling && (
              <div
                className={styles.calling_text}
                style={{ color: "#000", textAlign: "center" }}
              >
                呼叫中...
              </div>
            )}
          </div>
        )}
      </div>
      {/* 底部按钮 */}
      {!isCalling && callState.state !== CallStatusEnum.talking && canCall ? (
        <div className={styles.footer}>
          <div style={{ height: 48, width: 144 }}>
            <Button
              type="primary"
              style={{
                height: "100%",
                width: "100%",
                background: "#21B748",
                fontSize: 20,
              }}
              onClick={() => handleCall()}
            >
              <img src="/icons/icon_jieting.svg" width={24} alt="接听" />
              立即呼叫
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.footer_calling}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className={styles.footer_item}
              style={{ marginRight: 16 }}
              onClick={() => handleMuteAudio()}
            >
              <div
                className={styles.footer_icon}
                style={isMuteAudio ? { background: "rgba(0,0,0,0.5)" } : {}}
              >
                {isMuteAudio ? (
                  <img
                    src="/icons/icon_mute_disabled.svg"
                    width={24}
                    alt="静音"
                  />
                ) : (
                  <img src="/icons/icon_mute.svg" width={24} alt="未静音" />
                )}
              </div>
              <div className={styles.footer_text}>静音</div>
            </div>
            <div
              className={styles.footer_item}
              onClick={() => handleChangCallMode()}
            >
              <div
                className={styles.footer_icon}
                style={!isVideo ? { background: "rgba(0,0,0,0.5)" } : {}}
              >
                <span>
                  {!isVideo ? (
                    <img
                      src="/icons/icon_video_disabled.svg"
                      width={24}
                      alt="关摄像头"
                    />
                  ) : (
                    <img
                      src="/icons/icon_video.svg"
                      width={24}
                      alt="开摄像头"
                    />
                  )}
                </span>
              </div>
              <div className={styles.footer_text}>
                {isVideo ? "关摄像头" : "开摄像头"}
              </div>
            </div>
          </div>
          <div style={{ height: 48, width: 104 }}>
            <Button
              danger
              style={{
                height: "100%",
                width: "100%",
                background: "#DC3545",
                fontSize: 20,
                color: "#fff",
              }}
              onClick={() => dropCallUser()}
            >
              <img src="/icons/icon_guaduan.svg" width={24} alt="挂断" />
              挂断
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(VideoCall);
