export enum CallMode {
  AUDIO_VIDEO = "video",
  AUDIO_ONLY = "audio",
}

export enum CallTypeEnum {
  NORMAL = "normal",
  EMERGENCY = "emergency",
}

export enum CallReason {
  CANCEL = "cancel",
}

export enum CallStatusEnum {
  /** 初始状态，空闲中 */
  init = 1,
  /** 呼叫中 */
  calling,
  /** 通话中 */
  talking,
  /** 通话已结束 */
  end,
}

export enum CallReasonEnum {
  /** 初始状态 */
  init = 0,
  /** 通话结束（音响端挂断） */
  peerEnd = 2,
  /** 用户已挂断（拒接） */
  reject = 4,
  /** 无人接听,超时55秒 */
  timeout = 7,
  /** 管家已取消呼叫, 管家挂断电话 */
  localCancel = 8,
  /** 正常状态 state为2 */
  normal = 54,
  /** 音响端向管家打电话，管家不接 */
  localReject = 55,
}

export enum LoginStatusEnum {
  /** 离线中 */
  offLine = 0,
  /** 离开中 */
  outLine = 1,
  /** 在线中 */
  onLine = 2,
}

export const LoginStatusEnumDesc = {
  [LoginStatusEnum.offLine]: "离线中",
  [LoginStatusEnum.outLine]: "离开中",
  [LoginStatusEnum.onLine]: "在线中",
};
