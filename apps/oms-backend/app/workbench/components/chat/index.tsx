"use client";

import React, { useEffect, useRef, useMemo, memo } from "react";
import { Button, Input, Spin, Upload, App, Image } from "antd";
import { RcFile } from "antd/es/upload";
import { UserInfo } from "../../workbenchDetail/const";
import styles from "./index.module.css";
import { useWebRTC } from "@/stores/useWebRtc";
import { useMethodStore } from "@/stores/useMethodStore";
import { post } from "@/request";
import { useSuperLock } from "@/hooks/useSuperLock";
import { uploadAliyun } from "@/utils/upload";
import dayjs from "dayjs";
import icon6 from "../../images/icon6.png";
import { useCallBackState } from "@/hooks/useCallBackState";
import { LoginStatusEnum } from "@/enums/webrtcEnum";

interface RecordsItem {
  id: string;
  mediaUrl: string;
  msgEventCode: string;
  msgType: number;
  systemMessage: number;
  textContent: string;
  notifyId: string;
  rePushStatus: number;
  inserttime: string;
  reasonMessage: string;
}

interface ChatProps {
  userInfo: UserInfo;
}

const Chat: React.FC<ChatProps> = ({ userInfo }) => {
  const { message } = App.useApp();
  const [state, setState] = useCallBackState<{
    textarea: string;
    list: RecordsItem[];
  }>({
    textarea: "",
    list: [],
  });

  const { webrtcState } = useWebRTC();
  const { triggerMethod, registerMethod } = useMethodStore();
  const scrollbarRef = useRef<HTMLDivElement>(null);

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

  // 滚动到底部
  const scrollToBottom = () => {
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollTop = scrollbarRef.current.scrollHeight;
    }
  };

  // 获取聊天记录
  const getChatRecord = async () => {
    const { data } = await post("/notifyService/queryImNotifyMessage", {
      butlerUserId: userInfo?.id,
    });
    setState({
      list: data,
    });
    setTimeout(scrollToBottom, 100);
  };

  // 发送消息
  const [handleSend, loading] = useSuperLock(async () => {
    if (webrtcState.loginStatus !== 1) {
      triggerMethod("handelOnAndOffline");
      return;
    }
    await post("/notifyService/imNotifyMessageSave", {
      textContent: state.textarea,
      butlerUserId: userInfo?.id,
      systemMessage: 2,
      msgType: 16,
    });
    setState({
      textarea: "",
    });
    getChatRecord();
  });

  // 再次推送
  const [handleSendAgain, imgSending] = useSuperLock(
    async (data: RecordsItem) => {
      if (webrtcState.loginStatus !== LoginStatusEnum.onLine) {
        triggerMethod("handelOnAndOffline");
        return;
      }
      await post("/notifyService/imNotifyMessageSave", {
        butlerUserId: userInfo?.id,
        id: data.id,
        systemMessage: 2,
        msgType: 17,
        mediaUrl: data.mediaUrl,
      });
      getChatRecord();
    }
  );

  // 登录校验
  const handleCheckLoginStatus = () => {
    if (webrtcState.loginStatus !== LoginStatusEnum.onLine) {
      triggerMethod("handelOnAndOffline");
      return;
    }
  };

  // 上传图片
  const [beforeUpload, uploading] = useSuperLock(async (file: RcFile) => {
    if (file.size > 5 * 1024 * 1024) {
      message.warning("文件大小不能超过5M");
      return;
    }
    const uploadImg = await uploadAliyun([file]);
    await post("/notifyService/imNotifyMessageSave", {
      butlerUserId: userInfo?.id,
      systemMessage: 2,
      msgType: 17,
      mediaUrl: uploadImg[0],
    });
    getChatRecord();
  });

  // 监听 userInfo.id 变化自动获取聊天记录
  useEffect(() => {
    if (userInfo?.id) {
      getChatRecord();
    }
  }, [userInfo?.id]);

  useEffect(() => {
    registerMethod("getChatRecord", getChatRecord);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Image src={icon6.src} width={20} alt="icon" preview={false} />
        <div className="ml-[10px]">聊天</div>
      </div>
      <div className={styles.content}>
        <Spin spinning={loading || imgSending || uploading}>
          <div
            style={{ height: "calc(100vh - 560px)", overflowY: "auto" }}
            ref={scrollbarRef}
          >
            {state.list.map((item) => (
              <div key={item.id}>
                {/* 系统消息 */}
                {item.systemMessage === 1 && (
                  <div className={styles.system_content}>
                    <div className={styles.system_text1}>
                      系统消息
                      {dayjs(item.inserttime).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                    <div className={styles.system_text2}>
                      {item.textContent}
                    </div>
                  </div>
                )}
                {/* reason */}
                {item.reasonMessage && (
                  <div className={styles.system_content}>
                    <div className={styles.system_text3}>
                      -{item.reasonMessage}-
                    </div>
                  </div>
                )}
                {/* 管家文本消息 */}
                {item.systemMessage === 2 && item.msgType === 16 && (
                  <div className={styles.normal_content}>
                    <div className={styles.normal_text1}>{agentInfo?.name}</div>
                    <div className={styles.normal_text2}>
                      {item.textContent}
                    </div>
                  </div>
                )}
                {/* 管家图片消息 */}
                {item.systemMessage === 2 && item.msgType === 17 && (
                  <div className={styles.normal_content}>
                    <div className={styles.normal_text1}>{agentInfo?.name}</div>
                    <Image
                      preview={false}
                      className={styles.normal_img}
                      src={item.mediaUrl}
                      alt="图片"
                    />
                    <div className={styles.normal_btn_content}>
                      {item.rePushStatus === 1 && (
                        <div
                          className={styles.normal_btn}
                          onClick={() => handleSendAgain(item)}
                        >
                          再次推送
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Spin>
      </div>
      <div className={styles.footer}>
        <div className={styles.upload_content}>
          <Upload
            accept=".jpg,.jpeg,.png"
            showUploadList={false}
            customRequest={({ file }) => beforeUpload(file as RcFile)}
            beforeUpload={() => false}
            disabled={webrtcState.loginStatus !== LoginStatusEnum.onLine}
          >
            <div
              className={styles.upload_btn}
              onClick={() => handleCheckLoginStatus()}
            >
              图片
            </div>
          </Upload>
        </div>
        <div className={styles.line}></div>
        <div className={styles.textarea_content}>
          <div className={styles.textarea_wrap}>
            <Input.TextArea
              value={state.textarea}
              onChange={(e) => setState({ textarea: e.target.value })}
              placeholder="请输入消息"
              maxLength={200}
              autoSize={{ minRows: 3, maxRows: 4 }}
              className={styles.textarea}
            />
          </div>
          <div className={styles.btn_content}>
            <div className={styles.btn}>
              <Button
                type="primary"
                onClick={() => handleSend()}
                loading={loading}
                disabled={!state.textarea.trim()}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Chat);
