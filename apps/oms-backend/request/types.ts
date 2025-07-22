import { HttpStatusCode } from "./status-code";

export interface ApiResponse<T = any> {
  result: HttpStatusCode;
  resultMessage: string;
  data: T;
  items: T[]; // 当前页的数据列表
  current: number; // 当前页码
  pageSize: number; // 每页大小
  total: number; // 总数据量
  lastPage: boolean; // 是否是最后一页
  [key: string]: any; // 其他可能的字段
}
