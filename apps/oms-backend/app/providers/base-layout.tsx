"use client";

import { asyncRouter, constantRouter } from "@/config/routes";
import BaseLayout from "@repo/admin-framework/layout-providers/base-layout";
import RootProvider from "@repo/admin-framework/layout-providers/root-provider";
import GlobalInstanceProvider from "@/stores/globalInstanceStore";
import { useUserStore } from "@/stores/useUserStore";
import { get, post } from "@/request";
import { useRouter } from "next/navigation";
import { filterRoutesByPathData } from "@/utils/routesHelp";
import { Avatar, Button, Modal, Tooltip } from "antd";
import Image from "next/image";
import { useCallBackState } from "@/hooks/useCallBackState";
import {
  CallReason,
  CallReasonEnum,
  CallStatusEnum,
  LoginStatusEnum,
  LoginStatusEnumDesc,
} from "@/enums/webrtcEnum";
import { useWebRTC } from "@/stores/useWebRtc";
import { MajordomoState } from "./const";
import { CheckCard } from "@ant-design/pro-components";
import { UserOutlined } from "@ant-design/icons";
import {
  RtcContext,
  CallMode,
  CallIntent,
  CallStateInfo,
  CallType,
  CallTypeEnum,
} from "@baidu/call-rtcsdk";
import { useEffect, useRef, useState } from "react";
import { useMethodStore } from "@/stores/useMethodStore";
import dayjs from "dayjs";
import BellRingModal from "./bellRingModal";

export default function MyBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const userInfo = useUserStore((state) => state.userInfo);
  const menusPermissions = useUserStore((state) => state.menusPermissions);
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);
  // WebRTC
  const {
    webrtcState,
    eventState,
    callState,
    setWebrtcState,
    setCallState,
    setEventState,
  } = useWebRTC();
  const { triggerMethod, registerMethod } = useMethodStore();

  const [state, setState] = useCallBackState<MajordomoState>({
    open: false,
    agentList: [],
    currentIndex: 0,
    bellDialogVisible: false,
    callerInfo: {} as any,
    tooltipVisible: true,
  });
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [countDownTime, setCountDownTime] = useState(8);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipIntervalId = useRef<NodeJS.Timeout | null>(null);
  const audioPlayer = useRef<HTMLAudioElement>(null);

  const routes = [
    ...filterRoutesByPathData(asyncRouter, menusPermissions || []),
    ...constantRouter,
  ];

  const isButler = menusPermissions?.includes("/workbench");
  const onLogOut = async () => {
    await post("/omsLoginService/logout");
    clearUserInfo();
    router.replace("/login");
  };

  // 获取管家三个状态的颜色tip
  const getTipColor = () => {
    if (webrtcState.loginStatus === LoginStatusEnum.offLine) {
      return "#AFB3BE";
    } else if (webrtcState.loginStatus === LoginStatusEnum.outLine) {
      return "#FFB400";
    } else {
      return "#21B748";
    }
  };

  const handelOnAndOffline = async () => {
    if (
      webrtcState.loginStatus === LoginStatusEnum.offLine ||
      webrtcState.loginStatus === LoginStatusEnum.outLine
    ) {
      const { data } = await get("/agentInfoService/listBind");
      setState({
        open: true,
        agentList: data,
      });
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      await post("/agentLoginService/logout", {
        agentId: Number(state.agentList[state.currentIndex]?.id),
        type: 1,
      });
      webrtcState.acspRtc.dropCall(CallReason.CANCEL);
      webrtcState.acspRtc.logout();
      setWebrtcState({
        loginStatus: LoginStatusEnum.offLine,
        agentId: Number(state.agentList[state.currentIndex]?.id),
      });
    }
  };
  // 获取接口的计时结果，放入缓存内，当有缓存，继续计时
  const getAndContinueTimer = (time: number) => {
    localStorage.setItem("elapsedMilliseconds", (time * 1000).toString());
    const savedElapsedMilliseconds = (time * 1000).toString();
    setElapsedMilliseconds(parseInt(savedElapsedMilliseconds));
  };

  // 重置音频
  const resetAudio = () => {
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      audioPlayer.current.currentTime = 0;
    }
  };

  // 建立长连接
  const createLink = async (agentId: string, thirdContactId: string) => {
    const { data } = await post("/agentLoginService/getLoginToken", {
      agentId: state.agentList[state.currentIndex]?.id,
    });
    const callName = data.name;
    const avatar = data.avatar;
    const acspRtc = new RtcContext(
      { localVideoContainer: "localVideo", peerVideoContainer: "peerVideo" },
      {
        onAuthStatusChanged: async (auth: any) => {
          console.log("onAuthStatusChanged", auth);
          if (auth.success) {
            const { data } = await post("/agentLoginService/login", {
              agentId: agentId,
            });
            getAndContinueTimer(data);
            resetAudio();
            setWebrtcState({
              loginStatus: LoginStatusEnum.onLine,
              callerInfo: {
                callType: CallType.service,
                callId: thirdContactId,
                callName: callName,
                callAvatar: avatar,
              },
              agentId: Number(state.agentList[state.currentIndex]?.id),
            });
          } else {
            setWebrtcState({
              loginStatus: LoginStatusEnum.offLine,
            });
            setCallState({
              state: CallStatusEnum.init,
              reason: CallReasonEnum.init,
            });
          }
        },
      },
      false, // 是否开启⽇志记录，建议 prod 环境关闭
      "prod"
    ) as any;
    setWebrtcState({
      acspRtc: acspRtc,
    });
    const loginParams = {
      appId: "apppdbpee4an5tx",
      uri: Number(data.uri),
      token: data.sign,
      ak: data.ak,
      orgId: data.orgId,
    };
    console.log("loginParams", loginParams);
    acspRtc.login(loginParams);
    // 来电监听
    acspRtc.setCallListener({
      onIncomingCall: async (intent: CallIntent) => {
        // 这里面能获取到用户的callId，调用接口获取用户信息
        console.log("%cintent======", "color:green", intent);
        const res = await get("/butlerUserService/detailByCallUri", {
          // todo 待修改成uri
          callUri: intent.uri,
        });
        const callRecordData = {
          agentId: agentId,
          // callType=1呼入，=2呼出
          callType: 1,
          urgentType: intent.type === CallTypeEnum.EMERGENCY ? 2 : 1,
          uri: intent.uri,
        };
        const { data } = await post("/callRecordsService/save", {
          ...callRecordData,
        });
        setWebrtcState({
          callRecordId: data,
          type: intent.type,
        });
        // 出现振铃弹窗，出现音频
        setState({
          callerInfo: res.data,
          bellDialogVisible: true,
        });
        audioPlayer.current?.play();
        // 记录一下来电的状态
        setEventState({
          clickEventMark: eventState.clickEventMark,
          onIncomingCallEventMark: true,
        });
      },
      onCallStateChanged: async (callState: CallStateInfo) => {
        console.log("%ccallState=====", "color:red", callState);
        if (callState.state === 1) {
          setCallState({
            state: CallStatusEnum.init,
            reason: CallReasonEnum.normal,
          });
        }
        if (callState.state === 2) {
          setCallState({
            state: CallStatusEnum.calling,
            reason: CallReasonEnum.normal,
          });
        }
        if (callState.state === 3) {
          // 已接通
          setState({
            bellDialogVisible: false,
          });
          resetAudio();
          await post("/callRecordsService/stateChange", {
            id: webrtcState.callRecordId,
            state: 1,
          });
          triggerMethod("getChatRecord");
          setCallState({
            state: CallStatusEnum.talking,
            reason: CallReasonEnum.normal,
          });
          setEventState({
            clickEventMark: false,
            onIncomingCallEventMark: false,
          });
        } else if (callState.state === 4) {
          // 呼叫已断开
          setState({
            bellDialogVisible: false,
          });
          resetAudio();
          const rejectReason = [
            CallReasonEnum.reject,
            CallReasonEnum.localReject,
          ];
          const rejectState = rejectReason.includes(callState.reason) ? 4 : 3;
          webrtcState.callRecordId &&
            (callState.reason === 2
              ? await post("/callRecordsService/stateChange", {
                  id: webrtcState.callRecordId,
                  state: rejectState,
                })
              : await post("/callRecordsService/stateChange", {
                  id: webrtcState.callRecordId,
                  state: rejectState,
                  reasonCode: callState.reason,
                }));
          triggerMethod("getChatRecord");
          triggerMethod("getUnAnswerCallRecordList");
          setCallState({
            state: CallStatusEnum.end,
            reason: callState.reason,
          });
          setEventState({
            clickEventMark: false,
            onIncomingCallEventMark: false,
          });
        }
      },
      onCallModeChanged: (callMode: CallMode) => {
        console.log("%conCallModeChanged.callMode", "color:red", callMode);
      },
      /**
       * 紧急通话取消回调
       * @description
       * - ⽤于通知紧急通话已被取消（如被其他客服接听或拨打⽅取消通话）
       * - 通话中收到紧急通话时，如果显示了切换提示，可以在此回调中关闭提示
       */
      onCancelEmergencyCall: () => {},
    });
  };

  // 启动计时器，心跳接口
  const startTimer = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    // setInterval不会清除定时器队列，每重复执行1次都会导致定时器叠加，setTimeout自带清除定时器
    intervalIdRef.current = setInterval(() => {
      post("/agentLoginService/heartBeat", {
        timestamp: dayjs().valueOf(),
        type: 1,
        bizData: JSON.stringify({
          agentId: state.agentList[state.currentIndex]?.id,
        }),
      });
      // setElapsedMilliseconds((prev) => {
      //   const next = prev + 1000;
      //   localStorage.setItem("elapsedMilliseconds", next.toString());
      //   // 这里可以发心跳接口
      //   post("/agentLoginService/heartBeat", {
      //     timestamp: dayjs().valueOf(),
      //     type: 1,
      //     bizData: JSON.stringify({
      //       agentId: state.agentList[state.currentIndex]?.id,
      //     }),
      //   });
      //   return next;
      // });
    }, 1000);
  };

  // 弹窗确定
  const handleConfirm = async () => {
    setState({
      open: false,
    });
    if (
      state.agentList.length > 0 &&
      typeof state.currentIndex !== "undefined"
    ) {
      localStorage.setItem(
        "currentAgent",
        JSON.stringify(state.agentList[state.currentIndex])
      );
      // 建立长连接
      await createLink(
        state.agentList[state.currentIndex]?.id ?? "",
        state.agentList[state.currentIndex]?.thirdContactId ?? ""
      );
      // 这里需要开启计时器
      startTimer();
    }
  };

  // 获取已用时间
  const formattedTime = () => {
    const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleDisableTooltip = () => {
    setState({
      tooltipVisible: false,
    });
    localStorage.setItem("tooltipVisible", "0");
  };

  const canShowTooltip = () => {
    const tooltipStorage = localStorage.getItem("tooltipVisible");
    return state.tooltipVisible && tooltipStorage !== "0" && countDownTime > 0;
  };

  const startTooltipTimer = () => {
    // 清除旧的定时器
    if (tooltipIntervalId.current) {
      clearInterval(tooltipIntervalId.current);
    }
    // 启动新的定时器
    tooltipIntervalId.current = setInterval(() => {
      setCountDownTime((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          if (tooltipIntervalId.current) {
            clearInterval(tooltipIntervalId.current);
            tooltipIntervalId.current = null;
          }
          return 0;
        }
      });
    }, 1000);
  };

  // 接听弹窗电话
  const handleAnswerCall = () => {
    // 重定向到工作台页面
    router.push(`/workbench/workbenchDetail?id=${state.callerInfo.id}`);
    // 接听电话
    post("/callRecordsService/stateChange", {
      id: webrtcState.callRecordId,
      state: 1,
    });
    if (
      webrtcState.type === CallTypeEnum.EMERGENCY &&
      callState.state === CallStatusEnum.talking
    ) {
      webrtcState.acspRtc.answerEmergencyCall();
    } else {
      webrtcState.acspRtc.answerCall(CallMode.AUDIO_VIDEO);
    }
  };
  // 拒接弹窗电话
  const handleRejectIncomingCall = () => {
    // callStateChange({ id: rtcState.callRecordId, state: 4 })
    if (
      webrtcState.type === CallTypeEnum.EMERGENCY &&
      callState.state === CallStatusEnum.talking
    ) {
      webrtcState.acspRtc.rejectEmergencyIncomingCall();
    } else {
      webrtcState.acspRtc.rejectIncomingCall("转移");
    }
  };

  useEffect(() => {
    registerMethod("handelOnAndOffline", handelOnAndOffline);
    startTooltipTimer();
    const handler = () => {
      webrtcState.acspRtc.dropCall(CallReason.CANCEL);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <RootProvider>
      <BaseLayout
        menuData={routes}
        avatar={userInfo?.avatar}
        username={userInfo?.realName}
        onLogout={() => onLogOut()}
        actionsRender={() => [
          isButler && (
            <Tooltip
              placement="bottom"
              title={() => (
                <div>
                  <div className="mr-2">上线后即可拨发接听电话</div>
                  <div className="flex justify-between">
                    <div
                      className="mr-2 cursor-pointer"
                      onClick={() => handleDisableTooltip()}
                    >
                      不再提示
                    </div>
                    <div className="cursor-pointer">关闭({countDownTime})</div>
                  </div>
                </div>
              )}
              open={canShowTooltip()}
            >
              <div className="flex items-center">
                <div className="flex flex-col items-center leading-normal mr-4">
                  <div
                    className="flex items-center"
                    style={{ color: getTipColor() }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ background: getTipColor() }}
                    />
                    管家{LoginStatusEnumDesc[webrtcState.loginStatus]}
                  </div>
                  {/* <div className="leading-normal text-[12px]">
                    工时:{formattedTime()}
                  </div> */}
                </div>
                <Button
                  style={{
                    backgroundColor:
                      webrtcState.loginStatus === LoginStatusEnum.onLine
                        ? "rgba(13, 110, 253, 0.6)"
                        : "#21b748",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  shape="round"
                  icon={
                    webrtcState.loginStatus === LoginStatusEnum.onLine ? (
                      <Image
                        src="/online_2.png"
                        alt=""
                        width={16}
                        height={16}
                      />
                    ) : (
                      <Image
                        src="/online_1.png"
                        alt=""
                        width={16}
                        height={16}
                      />
                    )
                  }
                  onClick={() => handelOnAndOffline()}
                >
                  {webrtcState.loginStatus === LoginStatusEnum.onLine
                    ? "下线"
                    : "上线"}
                </Button>
              </div>
            </Tooltip>
          ),
        ]}
      >
        <GlobalInstanceProvider />
        {children}
        <Modal
          title="请选择要登录的坐席"
          open={state.open}
          okText="确认"
          cancelText="取消"
          onCancel={() => setState({ open: false })}
          onOk={() => handleConfirm()}
        >
          {state.agentList.length > 0 ? (
            <CheckCard.Group
              defaultValue={"0"}
              onChange={(value) => {
                setState({
                  currentIndex: Number(value),
                });
              }}
            >
              {state.agentList.map((i, index) => (
                <CheckCard
                  title={i.name}
                  style={{ width: 180 }}
                  key={i.id}
                  description={i.phoneNumber}
                  value={index.toString()}
                  avatar={
                    <Avatar
                      style={{ backgroundColor: "#7265e6" }}
                      icon={<UserOutlined />}
                      size="large"
                    />
                  }
                />
              ))}
            </CheckCard.Group>
          ) : (
            <div>您还未配置账号的坐席，请先联系管理人员配置</div>
          )}
        </Modal>
        {/* 全局的振铃弹窗 */}
        <BellRingModal
          userInfo={state.callerInfo}
          open={state.bellDialogVisible}
          onAnswerCall={() => handleAnswerCall()}
          onRejectIncomingCall={() => handleRejectIncomingCall()}
        />
        {/* 振铃音频 */}
        <audio controls loop ref={audioPlayer} hidden>
          <source src="/bell.MP3" type="audio/mp3" />
        </audio>
      </BaseLayout>
    </RootProvider>
  );
}
