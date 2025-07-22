import {
  AliwangwangFilled,
  AndroidFilled,
  ContactsOutlined,
  CreditCardFilled,
  FilePdfFilled,
  FundFilled,
  NotificationOutlined,
  PhoneFilled,
  SettingFilled,
  SettingOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuDataItem } from "@ant-design/pro-components";
import React from "react";

export interface MyMenuDataItem extends MenuDataItem {
  isPage?: boolean;
}

export const asyncRouter: MyMenuDataItem[] = [
  {
    path: "/analysis",
    name: "分析页",
    icon: <FundFilled />,
  },
  {
    path: "/deviceList",
    name: "音箱列表",
    icon: <AndroidFilled />,
    btnPermissions: [
      { code: "deviceService:bind", name: "关联用户" },
      { code: "deviceService:export", name: "导出" },
      { code: "deviceService:import", name: "批量导入" },
      { code: "deviceService:showUser", name: "查看用户" },
    ],
  },
  {
    path: "/butlerUser",
    name: "用户列表",
    icon: <UsergroupAddOutlined />,
    isPage: true,
    btnPermissions: [
      { code: "butlerUserService:add", name: "新增" },
      { code: "butlerUserService:export", name: "导出" },
      { code: "butlerUserService:import", name: "批量导入" },
      { code: "butlerUserService:detail", name: "详情" },
      { code: "butlerUserService:bindAgent", name: "更换管家" },
      { code: "butlerUserService:bindDevice", name: "绑定设备" },
    ],
    children: [
      {
        path: "/butlerUser/detail",
        name: "用户详情",
        hideInMenu: true,
        btnPermissions: [
          { code: "butlerUserDetail:info", name: "用户信息" },
          { code: "butlerUserDetail:callRecord", name: "通话记录" },
          { code: "butlerUserDetail:device", name: "智能设备" },
          { code: "butlerUserDetail:registration", name: "挂号记录" },
          { code: "butlerUserDetail:alarm", name: "报警记录" },
          { code: "butlerUserDetail:editAllInfo", name: "编辑信息" },
          { code: "butlerUserDetail:unbindDevice", name: "解绑/关联设备" },
          { code: "butlerUserDetail:viewCallDetail", name: "查看通话详情" },
          { code: "butlerUserDetail:unbindBind", name: "解绑/绑定" },
          { code: "butlerUserDetail:editDeviceName", name: "修改设备名称" },
          {
            code: "butlerUserDetail:viewDeviceInfo",
            name: "查看智能设备详情",
          },
          { code: "butlerUserDetail:cancelAppointment", name: "取消预约" },
          {
            code: "butlerUserDetail:viewAppointmentDetail",
            name: "查看预约详情",
          },
          { code: "butlerUserDetail:viewOrderDetail", name: "查看工单详情" },
          { code: "butlerUserDetail:closeOrder", name: "关闭工单" },
        ],
      },
    ],
  },
  {
    path: "/callManagement",
    name: "通话管理",
    icon: <PhoneFilled />,
    hideInBreadcrumb: true,
    children: [
      {
        path: "/callManagement/callRecords",
        name: "通话记录",
        btnPermissions: [
          {
            code: "/callRecords/callRecordsDetail:detail",
            name: "查看详情",
          },
          {
            code: "/callRecords/callRecords:export",
            name: "导出数据",
          },
        ],
      },
      {
        path: "/callManagement/contactManagement",
        name: "通讯录管理",
        btnPermissions: [
          {
            code: "/contactManagement/contactManagement:save",
            name: "新建联系人",
          },
          {
            code: "/contactManagement/contactManagement:enanble",
            name: "启用/禁用",
          },
          {
            code: "/contactManagement/contactManagement:edit",
            name: "编辑",
          },
          {
            code: "/contactManagement/contactManagement:del",
            name: "删除",
          },
          {
            code: "/contactManagement/contactManagement:detail",
            name: "查看详情",
          },
        ],
      },
    ],
  },
  {
    path: "/smartDeviceManagement",
    name: "硬件管理",
    icon: <SettingFilled />,
    hideInBreadcrumb: true,
    children: [
      {
        path: "/smartDeviceManagement/smartDeviceList",
        name: "硬件列表",
        btnPermissions: [
          { code: "smartDevice:bind", name: "关联用户" },
          { code: "smartDevice:unbind", name: "解绑" },
          { code: "smartDevice:edit", name: "编辑" },
          { code: "smartDevice:upload", name: "批量导入" },
          { code: "smartDevice:showDetail", name: "查看详情" },
        ],
      },
      {
        path: "/smartDeviceManagement/alertList",
        name: "报警工单",
        btnPermissions: [
          { code: "butlerAlert:viewDetail", name: "查看详情" },
          { code: "butlerAlert:batchExport", name: "批量导出" },
          { code: "butlerAlert:assgineWorker", name: "指派工单" },
          { code: "butlerAlert:closeOrder", name: "关闭工单" },
        ],
      },
    ],
  },
  {
    path: "/evaluateList",
    name: "测评订单",
    icon: <AndroidFilled />,
    isPage: true,
    btnPermissions: [
      { code: "/evaluateListIndex/evaluateDetail:detail", name: "详情" },
      // 下面的按钮功能在租户平台, oms没有这部分功能
      // {
      //   code: "/evaluateListIndex/evaluateDetail:send",
      //   name: "发送短信",
      // },
      // {
      //   code: "/evaluateListIndex/evaluateDetail:downLoad",
      //   name: "报告下载",
      // },
      // {
      //   code: "/evaluateListIndex/evaluateDetail:export",
      //   name: "导出数据",
      // },
    ],
    children: [
      {
        path: "/evaluateList/evaluateDetail",
        name: "测评详情",
        hideInMenu: true,
      },
    ],
  },
  {
    path: "/privilegeList",
    name: "权益列表",
    icon: <CreditCardFilled />,
    btnPermissions: [
      { code: "/privilegeList/privilege:export", name: "导出" },
      { code: "/privilegeList/privilege:gencard", name: "生成权益卡" },
    ],
  },
  {
    path: "/workbench",
    name: "管家工作台",
    icon: <AliwangwangFilled />,
    isPage: true,
    btnPermissions: [
      { code: "butlerWorkbench:followUp", name: "处理/回访工单" },
      { code: "butlerWorkbench:callNow", name: "立即呼叫" },
      { code: "butlerWorkbench:userInformation", name: "用户信息" },
      { code: "butlerWorkbench:appointment", name: "预约挂号" },
      { code: "butlerWorkbench:registrationRecord", name: "挂号记录" },
      { code: "butlerWorkbench:alarmOrder", name: "报警工单" },
      { code: "butlerWorkbench:callLog", name: "通话记录" },
    ],
    children: [
      {
        path: "/workbench/workbenchDetail",
        name: "工作台",
        hideInMenu: true,
        btnPermissions: [
          { code: "butlerWorkbench:followUp", name: "处理/回访工单" },
          { code: "butlerWorkbench:callNow", name: "立即呼叫" },
          { code: "butlerWorkbench:userInformation", name: "用户信息" },
          { code: "butlerWorkbench:appointment", name: "预约挂号" },
          { code: "butlerWorkbench:registrationRecord", name: "挂号记录" },
          { code: "butlerWorkbench:alarmOrder", name: "报警工单" },
          { code: "butlerWorkbench:callLog", name: "通话记录" },
        ],
      },
    ],
  },
  {
    path: "/notifyRecords",
    name: "通知列表",
    icon: <NotificationOutlined />,
    btnPermissions: [
      {
        code: "/notifyRecords:add",
        name: "新建通知",
      },
      {
        code: "/notifyRecords/notifyRecordsDetail:detail",
        name: "查看",
      },
      {
        code: "/notifyRecords/notifyRecordsReinform:again",
        name: "再次通知",
      },
    ],
  },

  {
    path: "/tenantList",
    name: "租户列表",
    icon: <ContactsOutlined />,
    btnPermissions: [
      { code: "/tenantList/tenant:add", name: "新增" },
      { code: "/tenantList/tenant:edit", name: "编辑" },
      { code: "/tenantList/tenant:del", name: "删除" },
      { code: "/tenantList/tenant:loginUrl", name: "链接" },
      { code: "/tenantList/tenant:detail", name: "详情" },
      {
        code: "/tenantList/tenant:resetAdminPassword",
        name: "重置管理员密码",
      },
    ],
  },
  {
    path: "/agreement",
    name: "协议管理",
    icon: <FilePdfFilled />,
    btnPermissions: [
      { code: "butlerAgreementService:add", name: "新增" },
      { code: "butlerAgreementService:remove", name: "删除" },
      { code: "butlerAgreementService:enable", name: "启用" },
    ],
  },
  {
    path: "/authorization",
    name: "权限管理",
    icon: <SettingOutlined />,
    hideInBreadcrumb: true,
    children: [
      {
        path: "/authorization/user",
        name: "账号管理",
        btnPermissions: [
          { code: "/authorization/user:add", name: "新增" },
          { code: "/authorization/user:edit", name: "编辑" },
          { code: "/authorization/user:del", name: "删除" },
          { code: "/authorization/user:resetPassword", name: "重置密码" },
        ],
      },
      {
        path: "/authorization/role",
        name: "角色管理",
        btnPermissions: [
          { code: "/authorization/role:add", name: "新增" },
          { code: "/authorization/role:enableDisable", name: "启用/禁用" },
          { code: "/authorization/role:edit", name: "编辑" },
          { code: "/authorization/role:del", name: "删除" },
          { code: "authorization:role:viewDetail", name: "查看详情" },
        ],
      },
      {
        path: "/authorization/menu",
        name: "菜单管理",
        btnPermissions: [
          { code: "/authorization/menu:batchImport", name: "同步" },
          { code: "/authorization/menu:authorized", name: "授权" },
          { code: "/authorization/menu:add", name: "新增" },
          { code: "/authorization/menu:del", name: "删除" },
        ],
      },
    ],
  },
  {
    path: "/resourcePermission",
    name: "资源权限",
    icon: <SettingFilled />,
    hideInMenu: process.env.NEXT_PUBLIC_APP_ENV !== "development",
  },
];

export const constantRouter: MenuDataItem[] = [
  {
    path: "/userInfo",
    name: "我的",
    icon: <UserOutlined />,
  },
];
