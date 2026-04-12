"use client";

import { FC, memo, useEffect } from "react";
import {
  Checkbox,
  CheckboxChangeEvent,
  Input,
  List,
  Pagination,
  Radio,
  RadioChangeEvent,
  Select,
  Tabs,
} from "antd";
import { useCallBackState } from "@/hooks/useCallBackState";
import { get } from "@/request";
import styles from "./index.module.css";
import UserItem, { UserItemInfo } from "../userItem";

const Component: FC = () => {
  const [state, setState] = useCallBackState<{
    current: string;
    deviceStatusSummary: {
      allCount: number;
      offlineCount: number;
      onlineCount: number;
      otherCount: number;
    };
    checked: boolean;
    sortValue: string;
    inputValue: string;
    startPage: number;
    pageSize: number;
    total: number;
    userList: UserItemInfo[];
  }>({
    current: "0",
    deviceStatusSummary: {
      allCount: 0,
      offlineCount: 0,
      onlineCount: 0,
      otherCount: 0,
    },
    checked: false,
    sortValue: "0",
    inputValue: "",
    startPage: 1,
    pageSize: 10,
    total: 0,
    userList: [],
  });

  const options = [
    { label: "默认排序", value: "0" },
    { label: "上次通话时间从近到远", value: "1" },
    { label: "上次通话时间从远到近", value: "2" },
    { label: "设备活跃天数从多到少", value: "3" },
    { label: "设备活跃天数从少到多", value: "4" },
  ];

  const getSortArgs = () => {
    if (state.sortValue === "0") {
      return {
        ascs: "user_name_pinyin",
      };
    } else if (state.sortValue === "1") {
      return {
        descs: "last_call_date",
      };
    } else if (state.sortValue === "2") {
      return {
        ascs: "last_call_date",
      };
    } else if (state.sortValue === "3") {
      return {
        descs: "week_active_count",
      };
    } else if (state.sortValue === "4") {
      return {
        ascs: "week_active_count",
      };
    }
  };
  const handleChangeTab = (e: RadioChangeEvent) => {
    setState({
      current: e.target.value,
    });
    getDeviceStatusSummary();
  };

  const handleCheckbox = (e: CheckboxChangeEvent) => {
    setState({
      checked: e.target.checked,
    });
    getDeviceStatusSummary();
  };
  const handleSelect = (e: string) => {
    setState({
      sortValue: e,
    });
    getDeviceStatusSummary();
  };
  const handleSearch = (e: string) => {
    setState({
      inputValue: e,
    });
    getDeviceStatusSummary();
  };

  const getDeviceStatusSummary = async () => {
    const { data } = await get("/butlerWorkerService/deviceStatusSummary");
    state.deviceStatusSummary = data;
  };

  const getUserList = async () => {
    const extendParams =
      state.current === "0" ? {} : { deviceStatus: state.current };
    const extendCheckParams = state.checked
      ? { onlyShowUnHandledAlertUser: 1 }
      : {};
    const res = await get("/butlerWorkerService/butlerWorkerPage", {
      startPage: state.startPage,
      pageSize: state.pageSize,
      userName: state.inputValue,
      ...extendParams,
      ...getSortArgs(),
      ...extendCheckParams,
    });
    setState({
      total: res.total,
      userList: res.items,
    });
  };

  const handlePageChange = (page: number, size: number) => {
    setState({
      startPage: page,
      pageSize: size,
    });
  };

  useEffect(() => {
    getDeviceStatusSummary();
  }, []);

  useEffect(() => {
    getUserList();
  }, [
    state.current,
    state.checked,
    state.sortValue,
    state.inputValue,
    state.startPage,
    state.pageSize,
  ]);

  return (
    <div className="bg-white h-full w-full rounded-lg flex flex-col pt-[24px] pr-[20px] pb-[14px] pl-[20px]">
      {/* 头部筛选区 - 固定高度 */}
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex items-center">
          <Radio.Group
            defaultValue="0"
            size="large"
            onChange={(e) => handleChangeTab(e)}
          >
            <Radio.Button value="0">
              全部（{state.deviceStatusSummary.allCount}）
            </Radio.Button>
            <Radio.Button value="1">
              音箱在线（{state.deviceStatusSummary.onlineCount}）
            </Radio.Button>
            <Radio.Button value="2">
              音箱离线（{state.deviceStatusSummary.offlineCount}）
            </Radio.Button>
            <Radio.Button value="-1">
              其他（{state.deviceStatusSummary.otherCount}）
            </Radio.Button>
          </Radio.Group>
          <div className="ml-4">
            <Checkbox onChange={(e) => handleCheckbox(e)}>
              仅展示有未完成工单用户
            </Checkbox>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-4 font-bold text-base">排序</div>
          <Select
            defaultValue={"0"}
            options={options}
            style={{ width: 210, marginRight: 20, height: 38 }}
            onChange={(e) => handleSelect(e)}
          />
          <Input.Search
            placeholder="请输入用户姓名/手机号"
            style={{ width: 240 }}
            className={styles.searchInput}
            onSearch={(value) => handleSearch(value)}
          />
        </div>
      </div>

      {/* 列表区域 - 可滚动，占据剩余空间 */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <List
          grid={{
            gutter: 24,
            xs: 1, // 超小屏幕 1 列
            sm: 2, // 小屏幕 2 列
            md: 3, // 中等屏幕 3 列
            lg: 4, // 大屏幕 4 列
            xl: 5, // 超大屏幕 4 列
          }}
          dataSource={state.userList}
          renderItem={(item) => (
            <List.Item>
              <UserItem userInfo={item} />
            </List.Item>
          )}
        />
      </div>

      {/* 分页区域 - 固定在底部 */}
      <Pagination
        align="end"
        showQuickJumper
        current={state.startPage}
        pageSize={state.pageSize}
        total={state.total}
        showTotal={(total) => `共 ${total} 条`}
        onChange={(page, size) => {
          handlePageChange(page, size);
        }}
      />
    </div>
  );
};

const ButlerWorkerList = memo(Component);
export default ButlerWorkerList;
