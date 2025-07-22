"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Select, Input, message } from "antd";
import Image from "next/image";
import { get, post } from "@/request";
import { DeviceType } from "@/enums/deviceEnum";
import { FC } from "react";

interface Device {
  id: string;
  deviceType: number;
  deviceName: string;
  deviceSn: string;
  onlineStatus: number;
  deviceIcon: string;
}

interface DeviceOption {
  deviceId: string;
  code: string;
  name: string;
  type: number;
}

interface SmartDeviceProps {
  userId: string;
  isCurrentTenantUser: boolean;
  canUnbind: boolean;
  canEditName: boolean;
  canViewInfo: boolean;
}

const SmartDevice: FC<SmartDeviceProps> = ({
  userId,
  isCurrentTenantUser,
  canUnbind,
  canEditName,
  canViewInfo,
}) => {
  const [isUnbindModalVisible, setIsUnbindModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editDeviceName, setEditDeviceName] = useState("");
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] =
    useState<Device | null>(null);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  // 在组件状态中添加绑定相关状态
  const [isBindModalVisible, setIsBindModalVisible] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<DeviceOption[]>([]);
  const [selectedDeviceToBind, setSelectedDeviceToBind] =
    useState<DeviceOption>();

  // 替换原来的 alert 解绑逻辑
  const handleUnbindClick = (device: Device) => {
    setSelectedDevice(device);
    setIsUnbindModalVisible(true);
  };

  const handleUnbindConfirm = async () => {
    if (selectedDevice) {
      await post("/butlerUserService/device-unbind", {
        butlerUserId: userId,
        deviceSn: selectedDevice.deviceSn,
        deviceType: selectedDevice.deviceType,
      });
      getUserSmartDevices(); // 刷新设备列表
    }
    setIsUnbindModalVisible(false);
  };

  const handleUnbindCancel = () => {
    setIsUnbindModalVisible(false);
  };

  // 编辑按钮点击事件
  const handleEditClick = (device: Device) => {
    setSelectedDeviceForEdit(device);
    setEditDeviceName(device.deviceName);
    setIsEditModalVisible(true);
  };

  // 提交编辑
  const handleEditConfirm = async () => {
    if (selectedDeviceForEdit) {
      const res = await post("/deviceService/updateDeviceName", {
        code: selectedDeviceForEdit.deviceSn,
        name: editDeviceName,
      });
      getUserSmartDevices(); // 刷新设备列表
    }
    setIsEditModalVisible(false);
  };

  // 取消编辑
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  // 添加获取可用设备列表的函数
  const fetchAvailableDevices = async (deviceType: number) => {
    try {
      const res = await get("/deviceService/list", {
        bound: 0,
        type: deviceType,
      });
      setAvailableDevices(res.data);
    } catch (error) {
      console.error("获取可用设备失败:", error);
    }
  };

  // 绑定设备确认函数
  const handleBindConfirm = async () => {
    if (!selectedDeviceToBind) {
      return;
    }

    try {
      const res = await post("/butlerUserService/device-bind", {
        butlerUserId: userId,
        deviceSn: selectedDeviceToBind.code,
        deviceType: selectedDeviceToBind.type,
      });
      if (res.result !== 0) {
        message.error(res.resultMessage || "绑定设备失败");
      }

      getUserSmartDevices(); // 刷新设备列表
      setIsBindModalVisible(false);
    } catch (error) {
      console.error("绑定设备失败:", error);
    }
  };

  const getUserSmartDevices = async () => {
    const res = await get("/butlerUserService/getSmartDevicesByButlerUserId", {
      butlerUserId: userId,
    });
    setDeviceList(res.data);
  };

  const showSleepDetail = (device: Device) => {
    window.open(
      `https://www.yfcarecloud.com/ecs-up-ws/sleepReport.do?page=day-report&devId=${device.deviceSn}`
    );
  };

  useEffect(() => {
    getUserSmartDevices();
  }, []);

  const getStatusColor = (status: number) => {
    return status === 1 ? "bg-green-500" : "bg-gray-500";
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "在线" : "离线";
  };

  return (
    <div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deviceList.map((device) => (
            <Card
              key={device.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md"
            >
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {device.deviceName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    编号: {device.deviceSn || "未绑定"}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${getStatusColor(
                        device.onlineStatus
                      )}`}
                    ></span>
                    <span className="text-sm">
                      {getStatusText(device.onlineStatus)}
                    </span>
                  </div>
                </div>
                <Image
                  src={device.deviceIcon}
                  alt={device.deviceName}
                  width={150}
                  height={150}
                  className="w-24 h-24 object-contain object-top"
                />
              </div>
              {isCurrentTenantUser && (
                <div className="px-4 pb-4 flex space-x-2">
                  {device.deviceSn ? (
                    <>
                      {canUnbind && (
                        <Button
                          danger
                          size="small"
                          onClick={() => handleUnbindClick(device)}
                        >
                          解绑设备
                        </Button>
                      )}
                      {canEditName && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleEditClick(device)}
                        >
                          编辑
                        </Button>
                      )}
                      {canViewInfo &&
                        device.deviceType === DeviceType.SLEEP_MONITOR && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => showSleepDetail(device)}
                          >
                            查看详情
                          </Button>
                        )}
                    </>
                  ) : (
                    <>
                      {canViewInfo &&
                        device.deviceType === DeviceType.SLEEP_MONITOR && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => showSleepDetail(device)}
                          >
                            查看详情
                          </Button>
                        )}
                      {canUnbind && (
                        <Button
                          size="small"
                          onClick={() => {
                            fetchAvailableDevices(device.deviceType);
                            setIsBindModalVisible(true);
                          }}
                        >
                          绑定设备
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      <Modal
        title="确认解绑"
        open={isUnbindModalVisible}
        onOk={handleUnbindConfirm}
        onCancel={handleUnbindCancel}
        okText="确认"
        cancelText="取消"
      >
        <p>
          您确定要解绑设备 <strong>{selectedDevice?.deviceName}</strong> 吗？
        </p>
      </Modal>
      <Modal
        title="编辑设备名称"
        open={isEditModalVisible}
        onOk={handleEditConfirm}
        onCancel={handleEditCancel}
        okText="确认"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="设备名称">
            <Input
              value={editDeviceName}
              onChange={(e) => setEditDeviceName(e.target.value)}
              placeholder="请输入新的设备名称"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="绑定设备"
        open={isBindModalVisible}
        onOk={handleBindConfirm}
        onCancel={() => setIsBindModalVisible(false)}
        okText="确认绑定"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="选择设备" required>
            <Select
              placeholder="请选择要绑定的设备"
              value={selectedDeviceToBind?.code}
              onChange={(value) => {
                const selected = availableDevices.find((d) => d.code === value);
                setSelectedDeviceToBind(selected);
              }}
              optionFilterProp="children"
              showSearch
            >
              {availableDevices.map((device) => (
                <Select.Option key={device.code} value={device.code}>
                  {device.code} ({device.name})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmartDevice;
