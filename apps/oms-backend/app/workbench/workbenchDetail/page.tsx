"use client";
import { FC, memo, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnAnswerList from "../components/unAnswerList";
import WorkOrderList from "../components/workOrderList";
import Image from "next/image";
import { get } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { UserInfo } from "./const";
import icon1 from "../components/userItem/images/icon1.png";
import icon2 from "../components/userItem/images/icon2.png";
import icon3 from "../components/userItem/images/icon3.png";
import icon5 from "../components/userItem/images/icon5.png";
import icon6 from "../components/userItem/images/icon6.png";
import switchIcon from "../components/userItem/images/switch.png";
import { mapGenderName } from "@/enums/genderEnum";
import { useWebRTC } from "@/stores/useWebRtc";
import { CallStatusEnum } from "@/enums/webrtcEnum";
import VideoCall from "../components/videoCall";
import Chat from "../components/chat";
import SliderBar from "../components/sliderBar";
import CallingRecords from "../components/callingRecords";
import UserRecord from "../components/userRecord";
import WorkOrderRecord from "../components/workOrderRecord";

const Component: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { callState, webrtcState, eventState } = useWebRTC();

  const [state, setState] = useCallBackState({
    userInfo: {} as UserInfo,
    currentIndex: -1,
  });

  const getGenderIcon = () => {
    if (state.userInfo.gender === 0) {
      return icon6;
    } else if (state.userInfo.gender === 1) {
      return icon5;
    } else {
      return icon1;
    }
  };

  const isCalling = useMemo(() => {
    return (
      (callState.state === CallStatusEnum.calling &&
        eventState.clickEventMark) ||
      (callState.state === CallStatusEnum.calling &&
        eventState.onIncomingCallEventMark)
    );
  }, []);
  const isDisabledSwitchUser = () => {
    return callState.state === CallStatusEnum.talking || isCalling;
  };

  const handleSwitchUser = () => {
    if (isDisabledSwitchUser()) {
      return;
    }
    router.replace("/workbench");
  };

  const getUserInfo = async () => {
    const id = searchParams?.get("id");
    if (id) {
      const { data } = await get("/butlerUserService/detail", {
        butlerUserId: id,
      });
      setState({
        userInfo: data,
      });
      localStorage.setItem("currentUserDetail", JSON.stringify(data));
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div className="flex h-[calc(100vh-210px)]">
      <div>
        <div className="h-[calc(50%-10px)] rounded-lg">
          <UnAnswerList />
        </div>
        <div className="h-[calc(50%-10px)] mt-[20px] rounded-lg">
          <WorkOrderList />
        </div>
      </div>
      <div className="flex flex-col ml-[10px] flex-1 min-h-0">
        {/* 用户信息展示 */}
        <div className="bg-white rounded-lg flex items-center justify-between py-[6px] px-[20px] mb-[10px]">
          {/* left_content */}
          <div className="flex items-center">
            <Image
              src={state.userInfo.avatar || "/avatar.jpg"}
              alt="avatar"
              width={64}
              height={64}
              className="rounded-full mr-2 h-[64px] w-[64px]"
            />
            <div>
              <div className="flex items-center">
                <div className="font-medium text-[16px] text-black mr-10">
                  {state.userInfo.userName}
                </div>
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      state.userInfo.deviceStatus === 1 ? "#21B748" : "#757880",
                  }}
                />
                <div
                  className="font-medium text-[16px]"
                  style={{
                    color:
                      state.userInfo.deviceStatus === 1 ? "#21B748" : "#757880",
                  }}
                >
                  {state.userInfo.deviceStatus === 1 ? "音箱在线" : "音箱离线"}
                </div>
              </div>
              <div className="flex items-center mt-1">
                <div className="flex items-center mr-3">
                  <Image
                    src={getGenderIcon()}
                    alt="gender"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  <div className="font-normal text-xs text-[#afb3be]">
                    {mapGenderName(state.userInfo.gender)}
                  </div>
                </div>
                <div className="flex items-center mr-3">
                  <Image
                    src={icon2}
                    alt="age"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  <div className="font-normal text-xs text-[#afb3be]">
                    {state.userInfo.age || "-"}岁
                  </div>
                </div>
                <div className="flex items-center mr-3">
                  <Image
                    src={icon3}
                    alt="tenant"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  <div className="font-normal text-xs text-[#afb3be]">
                    {state.userInfo.tenantName || "未知"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* right_content */}
          <div
            className={
              "w-[108px] h-8 rounded-[20px] flex items-center justify-center font-normal text-[16px] text-white transition-colors" +
              (isDisabledSwitchUser()
                ? " bg-[#AFB3BE] cursor-not-allowed"
                : " bg-[#0d6efd] cursor-pointer")
            }
            onClick={() => {
              if (!isDisabledSwitchUser()) handleSwitchUser();
            }}
          >
            <Image
              src={switchIcon}
              alt="switch"
              width={16}
              height={16}
              className="mr-1"
            />
            切换用户
          </div>
        </div>
        {/* 内容区域（视频，IM，用户信息等） */}
        <div className="flex flex-1 min-h-0">
          <VideoCall userInfo={state.userInfo} />
          <div className="ml-[8px] h-full">
            <Chat userInfo={state.userInfo} />
          </div>
          {state.currentIndex !== -1 && (
            <div className="ml-[8px] animate__animated animate__fadeInRight animate__faster h-full">
              {state.currentIndex === 0 && (
                <UserRecord userInfo={state.userInfo} />
              )}
              {state.currentIndex === 1 && (
                <WorkOrderRecord userInfo={state.userInfo} />
              )}
              {state.currentIndex === 2 && (
                <CallingRecords userInfo={state.userInfo} />
              )}
            </div>
          )}
          <div className="ml-[8px]">
            <SliderBar
              currentIndex={state.currentIndex}
              onChange={(index) => setState({ currentIndex: index })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkBenchDetail = memo(Component);
export default WorkBenchDetail;
