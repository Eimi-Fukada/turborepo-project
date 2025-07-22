"use client";

import { Avatar, Button, Card, Tabs, message, Modal } from "antd";
import { FC, memo, useEffect, useState } from "react";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import { listToTree } from "@/utils/help";
import { mapGenderName } from "@/enums/genderEnum";
import { DeviceType, mapDeviceStatusName } from "@/enums/deviceEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { mapComboDecr, mapComboName } from "@/enums/comboEnum";
import {
  mapBloodFatStatus,
  mapBloodPressureStatus,
  mapBloodSugarStatus,
  mapBloodType,
} from "@/enums/bloodEnum";
import { getChronicDiseaseLabel } from "@/enums/chronicDiseaseEnum";
import { mapSelfCareAbility } from "@/enums/selfCareEnum";
import { mapYesNoName } from "@/enums/yesNoEnum";
import CallRecords from "./CallRecords";
import SmartDevice from "./SmartDevice";
import RegisterRecords from "./RegisterRecords";
import ArchivesEdit from "./ArchivesEdit";
import ComboEdit from "./ComboEdit";
import ContactsEdit from "./ContactsEdit";
import BindDevice from "./BindDevice";
import AlertListComponent from "./AlertList";
import Edit from "./Edit";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { hasBtnPermission } from "@/utils/permission";

interface DetailState {
  regionTree: any[];
  isLoading: boolean;
  userData: any;
  activeTab: string;
}

interface ContactsItem {
  id: number;
  name: string;
  gender: number;
  relation: number;
  phone: string;
}

const Detail: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isCurrentTenantUser =
    searchParams.get("isCurrentTenantUser") === "true";

  const [state, setState] = useCallBackState<DetailState>({
    regionTree: [],
    isLoading: true,
    userData: null,
    activeTab: "info",
  });

  const [archivesEditOpen, setArchivesEditOpen] = useState(false);
  const [comboEditOpen, setComboEditOpen] = useState(false);
  const [contactsEditOpen, setContactsEditOpen] = useState(false);
  const [bindDeviceOpen, setBindDeviceOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Tab显示权限
  const canViewUserInfo = hasBtnPermission("butlerUserDetail:info");
  const canViewCallRecord = hasBtnPermission("butlerUserDetail:callRecord");
  const canViewDevice = hasBtnPermission("butlerUserDetail:device");
  const canViewRegistration = hasBtnPermission("butlerUserDetail:registration");
  const canViewAlarm = hasBtnPermission("butlerUserDetail:alarm");
  // 权限判断
  const canEditAllInfo = hasBtnPermission("butlerUserDetail:editAllInfo");
  const canUnbindDevice = hasBtnPermission("butlerUserDetail:unbindDevice");
  const canViewCallDetail = hasBtnPermission("butlerUserDetail:viewCallDetail");

  const canUnbind = hasBtnPermission("butlerUserDetail:unbindBind");
  const canEditDeviceName = hasBtnPermission("butlerUserDetail:editDeviceName");
  const canViewDeviceInfo = hasBtnPermission("butlerUserDetail:viewDeviceInfo");
  const canCancelAppointment = hasBtnPermission(
    "butlerUserDetail:cancelAppointment"
  );
  const canViewAppointmentDetail = hasBtnPermission(
    "butlerUserDetail:viewAppointmentDetail"
  );
  const canViewOrderDetail = hasBtnPermission(
    "butlerUserDetail:viewOrderDetail"
  );
  const canCloseOrder = hasBtnPermission("butlerUserDetail:closeOrder");

  // 根据城市code查找完整的城市路径
  const findCityPath = (targetCode: string, tree: any[]): any[] | null => {
    const path: any[] = [];

    const find = (nodes: any[]): boolean => {
      for (const node of nodes) {
        path.push(node);
        if (node.code === targetCode) {
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (find(node.children)) {
            return true;
          }
        }
        path.pop();
      }
      return false;
    };

    find(tree);
    return path.length > 0 ? path : null;
  };

  const getRegionList = async () => {
    const res = await get("regionQuery/list");
    const regionTree = listToTree(res.data, {
      id: "code",
      children: "children",
      pid: "parentCode",
    });
    setState({
      regionTree,
    });
  };

  const getUserData = async () => {
    if (!id) return;
    setState({ isLoading: true });
    const res = await get(`/butlerUserService/detail-encrypt`, {
      butlerUserId: id,
    });
    if (res.result === 0) {
      setState({
        userData: res.data,
        isLoading: false,
      });
    } else {
      message.error(res.resultMessage || "获取用户数据失败");
      setState({ isLoading: false });
    }
  };

  useEffect(() => {
    if (!id) {
      message.error("用户ID不能为空");
      router.back();
      return;
    }
    getRegionList();
    getUserData();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getRegionName = (code: string) => {
    if (!code || !state.regionTree) return "";
    const cityPath = findCityPath(code, state.regionTree);
    if (!cityPath) return "";

    return cityPath.map((node) => node.name).join("-");
  };

  const handleDeleteContact = async (contact: ContactsItem) => {
    Modal.confirm({
      title: "删除提示",
      content: `您确定要删除${contact.name}吗?`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      async onOk() {
        const res = await post(
          "/butlerUserService/deleteEmergencyContactById",
          contact.id
        );
        if (res.result === 0) {
          message.success("删除成功");
          getUserData();
        } else {
          message.error(res.resultMessage || "删除失败");
        }
      },
    });
  };
  const handleUnbind = (record: any) => {
    Modal.confirm({
      title: "解绑提示",
      content: "您确定要解绑设备吗?",
      type: "warning",
      onOk: async () => {
        const { result } = await post("/butlerUserService/unbindDevice", {
          butlerUserId: id,
          deviceSn: record.deviceSn,
          deviceType: DeviceType.SLIGHTLY,
        });
        result === 0 && message.success("解绑成功!");
        getUserData();
      },
    });
  };
  if (!id) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span>参数错误：用户ID不能为空</span>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span>加载中...</span>
      </div>
    );
  }

  if (!state.userData) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span>用户不存在</span>
      </div>
    );
  }

  const { archives, contacts, deviceSn, deviceStatus } = state.userData;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="mb-4"
        >
          返回列表
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <Avatar
          className="h-16 w-16 mr-4"
          src={state.userData.avatar}
          alt={state.userData.userName}
        />
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">{state.userData.userName}</h2>
            {deviceSn && (
              <span className="ml-4 text-sm">
                设备{mapDeviceStatusName(deviceStatus)}
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {mapGenderName(state.userData.gender)} | {state.userData.age}岁 |{" "}
            {state.userData.tenantName}
          </p>
        </div>
      </div>

      <Tabs
        activeKey={state.activeTab}
        onChange={(key) => setState({ activeTab: key })}
      >
        {canViewUserInfo && (
          <Tabs.TabPane tab="用户信息" key="info">
            <Card className="mb-6">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">基本信息</h3>
                {canEditAllInfo && (
                  <Button onClick={() => setEditOpen(true)}>编辑</Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <span className="font-medium">姓名: </span>
                  {state.userData.userName}
                </div>
                <div>
                  <span className="font-medium">性别: </span>
                  {mapGenderName(state.userData.gender)}
                </div>
                <div>
                  <span className="font-medium">出生日期: </span>
                  {state.userData.birthday}
                </div>
                <div>
                  <span className="font-medium">身份证号: </span>
                  {state.userData.idCard}
                </div>
                <div>
                  <span className="font-medium">联系电话: </span>
                  {mapRelationName(state.userData.phoneRelation)}-
                  {state.userData.phoneNumber}
                </div>
                <div>
                  <span className="font-medium">所属城市: </span>
                  {getRegionName(state.userData.city)}
                </div>
                <div>
                  <span className="font-medium">详细地址: </span>
                  {state.userData.address}
                </div>
                <div>
                  <span className="font-medium">所属街道: </span>
                  {state.userData.street}
                </div>
                <div>
                  <span className="font-medium">居委电话: </span>
                  {state.userData.committeePhone}
                </div>
                <div>
                  <span className="font-medium">是否独居: </span>
                  {mapYesNoName(state.userData.liveAlone)}
                </div>
                <div>
                  <span className="font-medium">所属租户: </span>
                  {state.userData.tenantName}
                </div>
                <div>
                  <span className="font-medium">创建时间: </span>
                  {state.userData.createTime}
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">设备信息</h3>
                {canUnbindDevice &&
                  (!deviceSn ? (
                    <Button onClick={() => setBindDeviceOpen(true)}>
                      关联设备
                    </Button>
                  ) : (
                    <Button danger onClick={() => handleUnbind(state.userData)}>
                      解绑
                    </Button>
                  ))}
              </div>
              <div className="p-4">
                <div>
                  <span className="font-medium">设备S/N: </span>
                  {deviceSn || "未绑定"}
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">套餐信息</h3>
                {canEditAllInfo && (
                  <Button onClick={() => setComboEditOpen(true)}>编辑</Button>
                )}
              </div>
              <div className="p-4">
                <div>
                  <span className="font-medium">选购套餐: </span>
                  {mapComboName(state.userData.combo)}
                </div>
                <div>
                  <span className="font-medium">套餐内容: </span>
                  {mapComboDecr(state.userData.combo)}
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">健康档案</h3>
                {canEditAllInfo && (
                  <Button onClick={() => setArchivesEditOpen(true)}>
                    编辑
                  </Button>
                )}
              </div>
              {archives ? (
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <span className="font-medium">身高: </span>
                    {archives.height}cm
                  </div>
                  <div>
                    <span className="font-medium">体重: </span>
                    {archives.weight}kg
                  </div>
                  <div>
                    <span className="font-medium">血压: </span>
                    {mapBloodPressureStatus(archives.bloodPressure)}
                  </div>
                  <div>
                    <span className="font-medium">血脂: </span>
                    {mapBloodFatStatus(archives.bloodLipid)}
                  </div>
                  <div>
                    <span className="font-medium">血糖: </span>
                    {mapBloodSugarStatus(archives.bloodSugar)}
                  </div>
                  <div>
                    <span className="font-medium">慢性病: </span>
                    {getChronicDiseaseLabel(archives.chronicDisease)}
                  </div>
                  <div>
                    <span className="font-medium">过敏药物: </span>
                    {archives.allergicMedications}
                  </div>
                  <div>
                    <span className="font-medium">运动量: </span>
                    {archives.exerciseFrequency}次/周
                  </div>
                  <div>
                    <span className="font-medium">血型: </span>
                    {mapBloodType(archives.bloodType)}
                  </div>
                  <div>
                    <span className="font-medium">吸烟: </span>
                    {archives.smoking === 1 ? "是" : "否"}
                  </div>
                  <div>
                    <span className="font-medium">喝酒: </span>
                    {archives.drinking === 1 ? "是" : "否"}
                  </div>
                  <div>
                    <span className="font-medium">能力: </span>
                    {mapSelfCareAbility(archives.selfCareAbility)}
                  </div>
                </div>
              ) : (
                <div className="p-4">暂无健康档案</div>
              )}
            </Card>

            <Card>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">紧急联系人</h3>
                {canEditAllInfo && (
                  <Button
                    onClick={() => {
                      setCurrentContact(null);
                      setContactsEditOpen(true);
                    }}
                  >
                    添加
                  </Button>
                )}
              </div>
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        性别
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        关系
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系电话
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts?.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mapGenderName(contact.gender)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mapRelationName(contact.relation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {canEditAllInfo && (
                            <>
                              <Button
                                type="link"
                                size="small"
                                className="mr-2"
                                onClick={() => {
                                  setCurrentContact(contact);
                                  setContactsEditOpen(true);
                                }}
                              >
                                编辑
                              </Button>
                              <Button
                                type="link"
                                danger
                                size="small"
                                onClick={() => handleDeleteContact(contact)}
                              >
                                删除
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Tabs.TabPane>
        )}

        {canViewCallRecord && (
          <Tabs.TabPane tab="通话记录" key="callRecords">
            <CallRecords userId={id} canViewDetail={canViewCallDetail} />
          </Tabs.TabPane>
        )}

        {canViewDevice && (
          <Tabs.TabPane tab="智能设备" key="device">
            <SmartDevice
              userId={id}
              isCurrentTenantUser={isCurrentTenantUser}
              canUnbind={canUnbind}
              canEditName={canEditDeviceName}
              canViewInfo={canViewDeviceInfo}
            />
          </Tabs.TabPane>
        )}

        {canViewRegistration && (
          <Tabs.TabPane tab="挂号记录" key="registerRecords">
            <RegisterRecords
              userId={id}
              canCancel={canCancelAppointment}
              canViewDetail={canViewAppointmentDetail}
            />
          </Tabs.TabPane>
        )}

        {canViewAlarm && (
          <Tabs.TabPane tab="报警记录" key="alertRecords">
            <AlertListComponent
              butlerUserId={id}
              canViewDetail={canViewOrderDetail}
              canClose={canCloseOrder}
            />
          </Tabs.TabPane>
        )}
      </Tabs>

      <ArchivesEdit
        open={archivesEditOpen}
        onOpenChange={setArchivesEditOpen}
        onSuccess={getUserData}
        editData={archives}
        butlerUserId={id}
      />
      <ComboEdit
        open={comboEditOpen}
        onOpenChange={setComboEditOpen}
        onSuccess={getUserData}
        editData={{
          id: state.userData.id,
          combo: state.userData.combo,
        }}
      />
      <ContactsEdit
        open={contactsEditOpen}
        onOpenChange={setContactsEditOpen}
        onSuccess={getUserData}
        editData={currentContact}
        butlerUserId={id}
      />
      <BindDevice
        open={bindDeviceOpen}
        onOpenChange={setBindDeviceOpen}
        onSuccess={getUserData}
        record={state.userData}
        deviceType={DeviceType.SLIGHTLY}
        title="绑定设备"
        snLabel="设备S/N"
      />
      <Edit
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={getUserData}
        editData={state.userData}
      />
    </div>
  );
};

export default Detail;
