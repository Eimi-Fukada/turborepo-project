import {
  CallReasonEnum,
  CallStatusEnum,
  CallTypeEnum,
  LoginStatusEnum,
} from "@/enums/webrtcEnum";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CallerInfo {
  callType: string;
  callId: string;
  callName: string;
  callAvatar: string;
}

interface WebRTCState<T = any> {
  loginStatus: LoginStatusEnum;
  acspRtc: T | null;
  callRecordId: string;
  callerInfo: CallerInfo | null;
  agentId: number;
  type?: CallTypeEnum;
}

interface CallState {
  state: CallStatusEnum;
  reason: CallReasonEnum;
}

interface EventState {
  clickEventMark: boolean;
  onIncomingCallEventMark: boolean;
}

interface WebRTCStore<T = any> {
  webrtcState: WebRTCState<T>;
  setWebrtcState: (partial: Partial<WebRTCState<T>>) => void;
  callState: CallState;
  setCallState: (partial: Partial<CallState>) => void;
  eventState: EventState;
  setEventState: (partial: Partial<EventState>) => void;
}

export const useWebRTC = create<WebRTCStore>()(
  devtools((set) => ({
    webrtcState: {
      loginStatus: LoginStatusEnum.offLine,
      acspRtc: null,
      callRecordId: "",
      callerInfo: null,
      agentId: -1,
      type: CallTypeEnum.NORMAL,
    },
    setWebrtcState: (partial) =>
      set((state) => ({
        webrtcState: { ...state.webrtcState, ...partial },
      })),
    callState: {
      state: CallStatusEnum.init,
      reason: CallReasonEnum.init,
    },
    setCallState: (partial) =>
      set((state) => ({
        callState: { ...state.callState, ...partial },
      })),
    eventState: {
      clickEventMark: false,
      onIncomingCallEventMark: false,
    },
    setEventState: (partial) =>
      set((state) => ({
        eventState: { ...state.eventState, ...partial },
      })),
  }))
);
