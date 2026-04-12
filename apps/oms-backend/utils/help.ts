import { uploadAliyun } from "./upload";
import dayjs from "dayjs";

/** 通话记录页面展示通话时长 */
export const formatDuration = (callState: number, seconds: number) => {
  if (callState !== 1) {
    // 未接通返回-
    return "-";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += `${hours}小时`;
  }
  if (minutes > 0) {
    formattedDuration += `${minutes}分`;
  }
  if (remainingSeconds > 0 || formattedDuration === "") {
    formattedDuration += `${remainingSeconds}秒`;
  }

  return formattedDuration;
};

interface TreeHelperConfig {
  id: string;
  children: string;
  pid: string;
}
const DEFAULT_CONFIG: TreeHelperConfig = {
  id: "id",
  children: "children",
  pid: "pid",
};

const getConfig = (config: Partial<TreeHelperConfig>) =>
  Object.assign({}, DEFAULT_CONFIG, config);

export const listToTree = <T = any>(
  list: T[],
  config: Partial<TreeHelperConfig> = {}
): T[] => {
  const conf = getConfig(config) as TreeHelperConfig;
  const nodeMap = new Map();
  const result: T[] = [];
  const { id, children, pid } = conf;

  for (const node of list) {
    node[children] = node[children] || [];
    nodeMap.set(node[id], node);
  }
  for (const node of list) {
    const parent = nodeMap.get(node[pid]);
    (parent ? parent.children : result).push(node);
  }
  return result;
};

export function findCascaderPath(options, targetCode, path = [] as any[]) {
  for (const item of options) {
    const newPath = [...path, item.code];
    if (item.code === targetCode) return newPath;
    if (item.children) {
      const res = findCascaderPath(item.children, targetCode, newPath);
      if (res) return res;
    }
  }
  return null;
}

export const findNode = <T = any>(
  tree: any,
  func: Function,
  config: Partial<TreeHelperConfig> = {}
): T | null => {
  config = getConfig(config);
  const { children } = config;
  const list = [...tree];
  for (const node of list) {
    if (func(node)) return node;
    node[children!] && list.push(...node[children!]);
  }
  return null;
};

export const exportFile = (filename: string, data: Blob) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

export const getAssetsUrl = async (assets: any[]) => {
  const nonOssAssets = assets.filter(
    (item) => !item?.url?.includes("digital-tec-pub")
  );
  const uploadedUrls = await uploadAliyun(nonOssAssets);

  let uploadIndex = 0;

  return assets.map((item) =>
    item?.url?.includes("digital-tec-pub")
      ? item.url
      : uploadedUrls[uploadIndex++]
  );
};

export const transformAge = (ageStr, birthTimestamp) => {
  if (ageStr && ageStr != "") {
    return ageStr;
  }
  const today = dayjs();
  const birthDate = dayjs(birthTimestamp);
  let age = today.year() - birthDate.year();
  // 如果当前日期还没到今年的生日，年龄减一
  if (
    today.month() < birthDate.month() ||
    (today.month() === birthDate.month() && today.date() < birthDate.date())
  ) {
    age--;
  }
  return age + "岁";
};

function getChineseWeekday(weekdayEN) {
  const weekdays = {
    Sunday: "星期日",
    Monday: "星期一",
    Tuesday: "星期二",
    Wednesday: "星期三",
    Thursday: "星期四",
    Friday: "星期五",
    Saturday: "星期六",
  };
  return weekdays[weekdayEN];
}
export const transformDate = (timestamp: number) => {
  const weekdayEN = dayjs(timestamp).format("dddd");
  return `${dayjs(timestamp).format("YYYY年M月D日")} ${getChineseWeekday(
    weekdayEN
  )}`;
};

export const getRiskColor = (level) => {
  if (level === 10) {
    return "#DC3545";
  } else if (level === 15) {
    return "#FA6C21";
  } else if (level === 20) {
    return "#F5A60A";
  } else {
    return "#00B578";
  }
};

export const getRiskName = (level) => {
  if (level === 10) {
    return "高风险";
  } else if (level === 15) {
    return "中高风险";
  } else if (level === 20) {
    return "中风险";
  } else {
    return "低风险";
  }
};

export const formatDurationForCalling = (duration: number) => {
  if (typeof duration !== "number" || isNaN(duration)) {
    return "无效的时长";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  let formattedDuration = "";

  if (hours > 0) {
    formattedDuration += `${hours}小时`;
  }
  if (minutes > 0 || hours > 0) {
    formattedDuration += `${minutes}分`;
  }
  if (seconds > 0 || formattedDuration === "") {
    formattedDuration += `${seconds}秒`;
  }

  return formattedDuration || "0秒";
};

export const formatDurationToTime = (duration) => {
  if (typeof duration !== "number" || isNaN(duration)) {
    return "00:00:00";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  // 确保每部分都至少为两位数
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
