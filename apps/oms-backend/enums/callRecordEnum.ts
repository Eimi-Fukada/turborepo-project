export enum CallType {
  ALL = "",
  OUTBOUND = "2",
  INBOUND = "1",
}

export enum CallStatus {
  ALL = "",
  ANSWERED = "1",
  UNANSWERED = "2",
  REJECTED = "4",
}

export const mapCallTypeName = (type: CallType): string => {
  const map = {
    [CallType.ALL]: "全部",
    [CallType.OUTBOUND]: "呼出",
    [CallType.INBOUND]: "呼入",
  };
  return map[type] || type;
};

export const mapCallStatusName = (status: CallStatus): string => {
  const map = {
    [CallStatus.ALL]: "全部",
    [CallStatus.ANSWERED]: "已接通",
    [CallStatus.UNANSWERED]: "未接通",
    [CallStatus.REJECTED]: "拒接",
  };
  return map[status] || status;
};