export enum NotifyDeviceType {
  All = 0,
  TenantList = 1,
  UserList = 2,
}

export function mapNotifyDeviceTypeDesc(type: NotifyDeviceType) {
  switch (type) {
    case NotifyDeviceType.All:
      return "全部设备";
    case NotifyDeviceType.TenantList:
      return "租户列表";
    case NotifyDeviceType.UserList:
      return "用户列表";
  }
}

export enum NotifyScreenType {
  All = 0,
  Half = 1,
}

export function mapNotifyScreenTypeDesc(type: NotifyScreenType) {
  switch (type) {
    case NotifyScreenType.All:
      return "全屏";
    case NotifyScreenType.Half:
      return "半屏";
  }
}

export enum ContentType {
  Content = 16,
  ContentAndImage = 17,
  Video = 18,
  Link = 19,
}

export function mapContentTypeDesc(type: ContentType) {
  switch (type) {
    case ContentType.Content:
      return "纯文本";
    case ContentType.ContentAndImage:
      return "图文";
    case ContentType.Video:
      return "视频";
    case ContentType.Link:
      return "链接";
  }
}

export enum PushType {
  Immediate = 1,
  Scheduled = 2,
}

export function mapPushTypeDesc(type: PushType) {
  switch (type) {
    case PushType.Immediate:
      return "立即推送";
    case PushType.Scheduled:
      return "定时推送";
  }
}
