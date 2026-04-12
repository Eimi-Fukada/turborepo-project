export interface CallingRecords {
  current: string;
  recordsSummary: {
    unAnswerCount: number;
    answerCount: number;
    rejectCount: number;
  };
  list: CallingRecordsInfo[];
  lastPage: boolean;
  startPage: number;
}

export interface CallingRecordsInfo {
  agentAccountId: string;
  agentId: string;
  answerWaitTime: number;
  audioFileId: string;
  avatar: string;
  butlerUserId: string;
  butlerUserName: string;
  callEndTime: string;
  callStartTime: string;
  callStatus: number;
  // 1-呼出，2-呼入
  callType: number;
  city: string;
  deviceSn: string;
  duration: number;
  id: string;
  inserttime: string;
  onlineStatus: number;
  phoneNumber: string;
  remark: string;
  tenantId: string;
  tenantName: string;
  // 1:日常类型,2:报警类型
  urgentType: number;
  userId: string;
  username: string;
  urgentDeviceName: string;
  urgentDeviceImei: string;
  urgentDeviceType: string;
}

export enum CallingStatusEnum {
  /** 已接通 */
  answer = 1,
  /** 未接通 */
  unAnswer = 2,
  /** 拒绝接听 */
  reject = 4,
}

export const CallingStatusEnumDesc = {
  [CallingStatusEnum.answer]: "已接通",
  [CallingStatusEnum.unAnswer]: "未接通",
  [CallingStatusEnum.reject]: "拒接",
};
