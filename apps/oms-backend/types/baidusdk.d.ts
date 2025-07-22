declare module "@baidu/call-rtcsdk" {
  export enum CallType {
    service = "service",
  }

  export class RtcContext {
    constructor(...options: any[]);
  }

  export enum CallMode {
    AUDIO_VIDEO = "video",
    AUDIO_ONLY = "audio",
  }

  export enum CallTypeEnum {
    NORMAL = "normal",
    EMERGENCY = "emergency",
  }

  export interface CallIntent {
    type: CallTypeEnum;
    callAvatar: string;
    callId: number;
    callMode: string;
    callName: string;
    callType: string;
    direction: number;
    uri: number;
    extra: {
      /**
       * 1. 空闲（感知不到）
       * 2. 发送offer中
       * 3. 呼叫已接通
       * 4. 呼叫已断开
       */
      state: number;
      callIntent: {
        avatar: string;
        id: number;
        intentType: string;
        name: string;
      };
    };
  }

  export interface CallStateInfo {
    /**
     * 1. 空闲（感知不到）
     * 2. 发送offer中
     * 3. 呼叫已接通
     * 4. 呼叫已断开
     */
    state: number;
    /**
     * 2. 通话结束（音响端挂断）
     * 4. 用户已挂断（拒接）
     * 7. 无人接听已挂断
     * 8. 管家端挂断电话
     * 55. 音响向管家拨打，管家直接挂断
     */
    reason: number;
  }
}
