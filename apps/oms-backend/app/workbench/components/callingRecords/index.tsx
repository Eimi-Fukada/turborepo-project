"use client";

import { FC, useEffect, memo } from "react";
import { UserInfo } from "../../workbenchDetail/const";
import styles from "./index.module.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Empty, Radio, Spin } from "antd";
import { get } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { CallingRecords } from "./const";
import CallingRecordsItem from "../callingRecordsItem";
import { useSuperLock } from "@/hooks/useSuperLock";
import Icon1 from "./images/icon1.png";

interface CallingRecordsProps {
  userInfo: UserInfo;
}
const Chat: FC<CallingRecordsProps> = ({ userInfo }) => {
  const [state, setState] = useCallBackState<CallingRecords>({
    recordsSummary: { unAnswerCount: 0, answerCount: 0, rejectCount: 0 },
    current: "2",
    list: [],
    lastPage: false,
    startPage: 1,
  });
  const getDeviceStatusSummary = async () => {
    const { data } = await get("/callRecordsService/callRecordSummary", {
      butlerUserId: userInfo?.id,
      source: "workBench",
    });
    setState({
      recordsSummary: data || {
        unAnswerCount: 0,
        answerCount: 0,
        rejectCount: 0,
      },
    });
  };
  const handleChangeTab = (index: string) => {
    setState({
      current: index,
      startPage: 1,
      list: [],
      lastPage: false,
    });
  };

  const [loadMore] = useSuperLock(async () => {
    if (state.lastPage) {
      return;
    }
    const { items, lastPage } = await get(
      "/callRecordsService/withButlerUserCallRecord",
      {
        pageSize: 10,
        startPage: state.startPage,
        callStatus: +state.current,
        butlerUserId: userInfo?.id,
        source: "workBench",
      }
    );
    setState({
      list: [...state.list, ...items],
      startPage: state.startPage + 1,
      lastPage: lastPage || true,
    });
  });

  useEffect(() => {
    if (userInfo.id) {
      getDeviceStatusSummary();
      loadMore();
    }
  }, [state.current, userInfo?.id]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src={Icon1.src} className={styles.icon} />
        <div className={styles.text}>通话记录</div>
      </div>
      <div className={styles.content}>
        <div
          className="flex mb-[12px] overflow-x-auto whitespace-nowrap"
          style={{ height: 60 }}
        >
          <Radio.Group
            defaultValue="2"
            size="large"
            onChange={(e) => handleChangeTab(e.target.value)}
          >
            <Radio.Button value="2">
              未接通（{state.recordsSummary.unAnswerCount}）
            </Radio.Button>
            <Radio.Button value="1">
              已接通（{state.recordsSummary.answerCount}）
            </Radio.Button>
            <Radio.Button value="4">
              拒接（{state.recordsSummary.rejectCount}）
            </Radio.Button>
          </Radio.Group>
        </div>
        {state.list.length > 0 ? (
          <div id="scrollableDiv" className={styles.infinite_list}>
            <InfiniteScroll
              dataLength={state.list.length}
              next={loadMore}
              hasMore={!state.lastPage}
              loader={<Spin tip="加载中..."></Spin>}
              endMessage={
                <div className={styles.nomore} style={{ textAlign: "center" }}>
                  仅展示最近一个月通话记录~
                </div>
              }
              scrollableTarget="scrollableDiv"
            >
              {state.list.map((item) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <CallingRecordsItem data={item} />
                </div>
              ))}
            </InfiniteScroll>
          </div>
        ) : (
          <div style={{ marginTop: 250 }}>
            <Empty description="暂无数据" />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Chat);
