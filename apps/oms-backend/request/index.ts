import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse } from "./types";
import { HttpStatusCode } from "./status-code";
import { message } from "@/stores/globalInstanceStore";
import { useUserStore } from "@/stores/useUserStore";

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
    const token = useUserStore.getState().token;
    config.headers["x-token"] = token ?? "";
    config.headers["Content-Type"] = "application/json";
    config.headers["x-system-code"] = "0f00788a35e64092b5fb39447527cb99";
    config.headers["x-tenant-code"] = "788a35e64092b5fb";
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
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
    const clearUserInfo = useUserStore.getState().clearUserInfo;
    const response = await instance.request<ApiResponse<T>>(config);
    const res = response.data;

    if (response.config.responseType === "blob") {
      // 如果是 blob 响应，直接返回 Blob 对象
      return response as unknown as ApiResponse<T>;
    } else if (res.result === HttpStatusCode.SUCCESS) {
      return res;
    } else if (res.result === HttpStatusCode.Unauthorized) {
      if (!config.silent) {
        message.warning("登录已过期，请重新登录");
      }
      clearUserInfo();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
      return res;
    } else {
      if (!config.silent) {
        message.error(res.resultMessage || "请求失败");
      }
      return res;
    }
  } catch (error) {
    if (!config.silent) {
      const err = error as AxiosError;
      message.error(err.message || "网络异常");
    }
    return Promise.reject(error);
  }
};

// 方法封装
export const get = <T = any>(
  url: string,
  params?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "GET", url, params });

export const post = <T = any>(
  url: string,
  data?: any,
  params?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "POST", url, params, data });

export const put = <T = any>(
  url: string,
  data?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "PUT", url, data });

export const del = <T = any>(
  url: string,
  data?: any,
  params?: any,
  config?: CustomRequestConfig
) => request<T>({ ...config, method: "DELETE", url, params, data });
