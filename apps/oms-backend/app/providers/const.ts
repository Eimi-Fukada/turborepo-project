export interface MajordomoState {
  agentList: {
    id: string;
    name: string;
    phoneNumber: string;
    thirdContactId: string;
  }[];
  open: boolean;
  currentIndex: number;
  bellDialogVisible: boolean;
  callerInfo: {
    id: string;
    userName: string;
    gender: number;
    age: number;
    tenantName: string;
    avatar: string;
  };
  tooltipVisible: boolean;
}
