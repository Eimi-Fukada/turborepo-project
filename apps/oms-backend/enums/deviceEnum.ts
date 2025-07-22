export enum DeviceType {
  VOICE = 0,
  ALARM = 1,
  CALLER,
  SLEEP_MONITOR,
  GATE_WAY,
  SLIGHTLY,
}

export const DeviceTypeOptions = [
  { value: DeviceType.VOICE, label: "语音指令" },
  { value: DeviceType.ALARM, label: "防跌倒激光雷达" },
  { value: DeviceType.CALLER, label: "拉绳报警器" },
  { value: DeviceType.SLEEP_MONITOR, label: "睡眠检测带" },
  { value: DeviceType.GATE_WAY, label: "网关" },
  { value: DeviceType.SLIGHTLY, label: "音箱" },
];

export const DeviceTypeValueEnum = {
  [DeviceType.VOICE]: { text: "语音指令" },
  [DeviceType.ALARM]: { text: "防跌倒激光雷达" },
  [DeviceType.CALLER]: { text: "拉绳报警器" },
  [DeviceType.SLEEP_MONITOR]: { text: "睡眠检测带" },
  [DeviceType.GATE_WAY]: { text: "网关" },
  [DeviceType.SLIGHTLY]: { text: "音箱" },
};

export function mapDeviceTypeName(entryType: DeviceType) {
  switch (entryType) {
    case DeviceType.VOICE:
      return "语音指令";
    case DeviceType.ALARM:
      return "防跌倒激光雷达";
    case DeviceType.CALLER:
      return "拉绳报警器";
    case DeviceType.SLEEP_MONITOR:
      return "睡眠检测带";
    case DeviceType.GATE_WAY:
      return "网关";
    case DeviceType.SLIGHTLY:
      return "音箱";
  }
}

export enum DeviceStatus {
  UN_MANAGED = 0,
  ONLINE = 1,
  OFFLINE = 2,
}

export function mapDeviceStatusName(entryType: DeviceStatus) {
  switch (entryType) {
    case DeviceStatus.UN_MANAGED:
      return "未管理";
    case DeviceStatus.ONLINE:
      return "在线";
    case DeviceStatus.OFFLINE:
      return "离线";
  }
}

export enum DeviceSource {
  BAIDU_BOX = "baidu",
  KANG_GUAN = "kang_guan",
}

export function mapDeviceSourceName(entryType: DeviceSource) {
  switch (entryType) {
    case DeviceSource.BAIDU_BOX:
      return "百度智能云";
    case DeviceSource.KANG_GUAN:
      return "康冠";
  }
}

export enum SmartDeviceSource {
  WANFENG_BOX = "wanfeng",
}

export function mapSmartDeviceSourceName(entryType: SmartDeviceSource) {
  switch (entryType) {
    case SmartDeviceSource.WANFENG_BOX:
      return "万沣";
  }
}
