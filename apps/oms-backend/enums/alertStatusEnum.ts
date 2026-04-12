export enum AlertStatus {
  UNHANDLED = 0,
  HANDLED,
  CLOSED,
}

export const AlertStatusOptions = [
  { value: AlertStatus.UNHANDLED, label: "待处理" },
  { value: AlertStatus.HANDLED, label: "待回访" },
  { value: AlertStatus.CLOSED, label: "已关闭" },
];

export const AlertStatusValueEnum = {
  [AlertStatus.UNHANDLED]: { text: "待处理" },
  [AlertStatus.HANDLED]: { text: "待回访" },
  [AlertStatus.CLOSED]: { text: "已关闭" },
};

export function mapAlertStatusName(entryType: AlertStatus) {
  switch (entryType) {
    case AlertStatus.UNHANDLED:
      return "待处理";
    case AlertStatus.HANDLED:
      return "待回访";
    case AlertStatus.CLOSED:
      return "已关闭";
  }
}
