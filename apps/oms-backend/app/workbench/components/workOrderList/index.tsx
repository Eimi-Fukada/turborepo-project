"use client";
import { FC, memo, useEffect } from "react";
import Image from "next/image";
import Icon1 from "../../images/icon1.png";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get } from "@/request";
import { Empty, Radio, RadioChangeEvent } from "antd";
import dayjs from "dayjs";
import { ReloadOutlined } from "@ant-design/icons";

interface WorkOrderInfo {
  address: string;
  age: string;
  alertNo: string;
  alertStatus: number;
  alertTime: string;
  butlerUserId: string;
  city: string;
  closeTime: string;
  contactList: any;
  deviceName: string;
  deviceSn: string;
  deviceSource: string;
  deviceType: number;
  duration: string;
  followUpStatus: number;
  gender: number;
  handlerUserId: string;
  handlerUserName: string;
  id: string;
  onlineStatus: number;
  phoneNumber: string;
  relation: number;
  street: string;
  tenantId: string;
  tenantName: string;
  userName: string;
}
const Component: FC = () => {
  const [state, setState] = useCallBackState<{
    workOderList: WorkOrderInfo[];
    current: string;
  }>({
    workOderList: [],
    current: "0",
  });

  const handleChangeTab = (e: RadioChangeEvent) => {
    setState({
      current: e.target.value,
    });
  };
  const getWorkOrderList = async () => {
    const res = await get("/butlerAlertService/butlerAlertUserList", {
      pageSize: 5,
      startPage: 1,
      alertStatus: +state.current,
    });
    setState({
      workOderList: res.items,
    });
  };

  useEffect(() => {
    getWorkOrderList();
  }, [state.current]);

  return (
    <div className="flex flex-col bg-white rounded-lg h-full">
      <div className="flex items-center justify-between h-[40px] pl-2 pr-2 font-medium text-base text-[#525459] border-b border-[#e9ebef]">
        <div className="flex items-center">
          <Image
            src={Icon1}
            className="mr-2"
            width={20}
            height={20}
            alt="icon"
          />
          <span className="h-full flex items-center">工单待办</span>
        </div>
        <ReloadOutlined
          style={{ color: "rgb(13, 110, 253)" }}
          onClick={() => getWorkOrderList()}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
        <Radio.Group
          defaultValue="0"
          size="large"
          onChange={(e) => handleChangeTab(e)}
        >
          <Radio.Button value="0">待处理</Radio.Button>
          <Radio.Button value="1">待回访</Radio.Button>
        </Radio.Group>
        {state.workOderList.length > 0 ? (
          <div className="mt-[8px]">
            {state.workOderList.map((item) => (
              <div
                key={item.id}
                className="flex items-end border-b border-[#e9ebef] pt-[8px] pb-[8px]"
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center font-bold text-base text-black">
                    <div
                      className="truncate max-w-[60%]"
                      style={{ color: "#DC3545" }}
                    >
                      {item.userName}
                    </div>
                    {!!item.deviceName && (
                      <div className="max-w-[60%] truncate ml-2 border-[#FFA39E] border-[1px] text-[#DC3545] rounded-full px-[8px]">
                        {item.deviceName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mt-[4px]">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        background:
                          item.onlineStatus === 1 ? "#21b748" : "#AFB3BE",
                      }}
                    />
                    <div
                      className="text-xs font-normal"
                      style={{
                        color: item.onlineStatus === 1 ? "#21b748" : "#AFB3BE",
                      }}
                    >
                      {item.onlineStatus === 1 ? "设备在线" : "设备离线"}
                    </div>
                  </div>
                  <div className="flex items-center mt-[4px]">
                    <div className="text-xs font-normal text-[#afb3be] mr-3">
                      {dayjs(item.alertTime).format("YYYY/MM/DD")}
                    </div>
                  </div>
                </div>
                <div className="w-[66px] h-[32px] bg-[#F3F7FF] text-[#0D6EFD] flex items-center justify-center rounded-[4px] cursor-pointer border-[#0D6EFD] border-[1px]">
                  去处理
                </div>
              </div>
            ))}
            <div className="text-center mt-3 text-[#757880] text-xs">
              仅展示最近5条数据~
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            <Empty description="暂无数据" />
          </div>
        )}
      </div>
    </div>
  );
};

const WorkOrderList = memo(Component);
export default WorkOrderList;
