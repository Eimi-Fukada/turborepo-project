// 定义接口请求的状态码枚举
export enum HttpStatusCode {
  SUCCESS = 0, // 请求成功
  Unauthorized = 401, // 未授权
  Forbidden = 403, // 没有权限访问资源
  NotFound = 404, // 资源不存在
  InternalServerError = 500, // 服务器内部错误
}
