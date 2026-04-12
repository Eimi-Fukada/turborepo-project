"use client";

import React, { useEffect } from "react";
import dayjs from "dayjs";
import { Empty } from "antd";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get } from "@/request";
import { useMethodStore } from "@/stores/useMethodStore";
import Image from "next/image";
import Icon5 from "../../images/icon5.png";
import Icon2 from "../../images/icon2.png";
import Icon4 from "../../images/icon4.png";

interface UnAnswerInfo {
  agentAccountId: string;
  agentId: string;
  answerWaitTime: number;
  audioFileId: number;
  avatar: string;
  butlerUserId: string;
  butlerUserName: string;
  callEndTime: string;
  callStartTime: string;
  callStatus: number;
  callType: number;
  deviceSn: string;
  duration: number;
  id: string;
  inserttime: string;
  onlineStatus: number;
  phoneNumber: string;
  remark: string;
  tenantId: string;
  tenantName: string;
  urgentType: number;
  userId: string;
  username: string;
}

const UnAnswerList: React.FC = () => {
  const { registerMethod } = useMethodStore();
  const [state, setState] = useCallBackState<{
    unAnswerRecordsList: UnAnswerInfo[];
    total: number;
  }>({
    unAnswerRecordsList: [],
    total: 0,
  });
  const getUnAnswerCallRecordList = async () => {
    const res = await get("/callRecordsService/unAnswerCallRecord", {
      pageSize: 10,
      startPage: 1,
      callStatus: 2,
    });
    setState({
      unAnswerRecordsList: res.items,
      total: res.total,
    });
  };

  useEffect(() => {
    getUnAnswerCallRecordList();
    registerMethod("getUnAnswerCallRecordList", getUnAnswerCallRecordList);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-lg h-full">
      <div className="flex items-center h-[40px] pl-2 font-medium text-base text-[#525459] border-b border-[#e9ebef]">
        <Image src={Icon5} className="mr-2" width={20} height={20} alt="icon" />
        <span className="h-full flex items-center">
          最近未接通话({state.unAnswerRecordsList.length})
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
        {state.total > 0 ? (
          <>
            {state.unAnswerRecordsList.map((item) => (
              <div
                key={item.id}
                className="flex items-center h-16 border-b border-[#e9ebef] mt-1"
              >
                <img
                  src={item.avatar || "/avatar.jpg"}
                  className="rounded-full mr-3 object-cover h-[52px]"
                  width={52}
                  height={52}
                  alt="avatar"
                  style={
                    item.urgentType === 1 ? {} : { border: "2px solid #DC3545" }
                  }
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center font-bold text-base text-black">
                    <div
                      className="truncate max-w-[60%]"
                      style={item.urgentType === 1 ? {} : { color: "#DC3545" }}
                    >
                      {item.butlerUserName}
                    </div>
                    {item.urgentType === 2 && (
                      <div className="ml-2 w-10 h-4.5 bg-[#dc3545] rounded-full text-xs text-white flex items-center justify-center">
                        报警
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between w-full mt-2">
                    <div className="flex items-center">
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
                          color:
                            item.onlineStatus === 1 ? "#21b748" : "#AFB3BE",
                        }}
                      >
                        {item.onlineStatus === 1 ? "音箱在线" : "音箱离线"}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs font-normal text-[#afb3be] mr-3">
                        {dayjs(item.callStartTime).format("YYYY/MM/DD")}
                      </div>
                      <Image
                        src={item.callType === 1 ? Icon2 : Icon4}
                        width={20}
                        height={20}
                        alt="callType"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center mt-3 text-[#757880] text-xs">
              仅展示最近10条数据~
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            <Empty description="暂无数据" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnAnswerList;
