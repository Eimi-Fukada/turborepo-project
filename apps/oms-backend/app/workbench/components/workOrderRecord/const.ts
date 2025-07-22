import { CallingRecordsInfo } from "../callingRecords/const";

export interface WorkOrderRecords {
  current: string;
  recordsSummary: {
    waitHandleCount: number;
    waitFollowUpCount: number;
    closedCount: number;
  };
  list: WorkOrderItemInfo[];
  lastPage: boolean;
  startPage: number;
  open: boolean;
  dataItem: WorkOrderItemInfo;
  callRecords: CallingRecordsInfo[];
}

export interface WorkOrderItemInfo {
  address: string;
  age: number;
  alertNo: string;
  alertStatus: number;
  alertTime: string;
  butlerUserId: string;
  city: string;
  closeTime: string;
  contactList: any[];
  deviceName: string;
  deviceSn: string;
  deviceSource: string;
  deviceType: number;
  duration: string;
  followUpStatus: number;
  gender: number;
  handlerUserId: number;
  handlerUserName: string;
  id: string;
  onlineStatus: number;
  phoneNumber: string;
  relation: number;
  street: string;
  tenantId: string;
  tenantName: string;
  userName: string;
  handleTime: string;
  handleCallRecordId: string[];
  remark: string;
  plannedFollowUpNotifyTime: string;
  followUpCallRecordId: string[];
  userFeedback: string;
  actualFollowUpTime: string;
}
