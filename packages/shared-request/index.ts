import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse } from "./types";
import { HttpStatusCode } from "./status-code";
import { message } from "antd";
import { getGlobalHeaders } from "./getDynamicHeaders";

// 可选扩展配置
interface CustomRequestConfig extends AxiosRequestConfig {
  silent?: boolean; // 静默模式，不抛出错误提示，因为有可能接口不为0需要抛出弹窗，有可能需要自定义逻辑，比如预约挂号
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

const instance = axios.create({
  baseURL,
  timeout: 6000,
  withCredentials: true,
});

// 请求拦截器（保留原始 config，不处理业务逻辑）
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const dynamicHeaders = getGlobalHeaders(); // 每次请求前获取最新 headers
    config.headers = {
      ...(dynamicHeaders || {}),
      ...(config.headers || {}),
    } as AxiosRequestHeaders;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器（不做 result 判断，只做 HTTP 层异常处理）
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

// ✅ 通用请求封装（业务逻辑由调用方处理）
const request = async <T = any>(
  config: CustomRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await instance.request<ApiResponse<T>>(config);
    const res = response.data;

    if (response.config.responseType === "blob") {
      // 如果是 blob 响应，直接返回 Blob 对象
      return response as unknown as ApiResponse<T>;
    }

    // 根据 result 字段统一判断
    if (res.result === HttpStatusCode.SUCCESS) {
      if (!config.silent) {
        message.success("操作成功");
      }
      return res;
    }

    if (res.result === HttpStatusCode.Unauthorized) {
      if (!config.silent) {
        message.warning("无权限，请重新登录");
      }
      return Promise.reject(res);
    }

    if (!config.silent) {
      message.error(res.resultMessage || "请求失败");
    }

    return Promise.reject(res);
  } catch (error) {
    if (!config.silent) {
      const err = error as AxiosError;
      message.error(err.message || "网络异常");
    }
    return Promise.reject(error);
  }
};

// 方法封装
export const get = <T = any>(url: string, config?: CustomRequestConfig) =>
  request<T>({ ...config, method: "GET", url });

export const post = <T = any>(
  url: string,
  data?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "POST", url, data });

export const put = <T = any>(
  url: string,
  data?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "PUT", url, data });

export const del = <T = any>(url: string, config?: CustomRequestConfig) =>
  request<T>({ ...config, method: "DELETE", url });
