"use client";

import { FC, useEffect, memo } from "react";
import { UserInfo } from "../../workbenchDetail/const";
import styles from "./index.module.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button, Empty, Form, Input, Radio, Select, Spin } from "antd";
import { get, post } from "@/request";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import Icon1 from "./images/icon1.png";
import Icon2 from "./images/icon2.png";
import { WorkOrderItemInfo, WorkOrderRecords } from "./const";
import WorkOrderItem from "../workOrderItem";
import styles1 from "../workOrderItem/index.module.css";
import { DeviceTypeOptions } from "@/enums/deviceEnum";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { formatDurationToTime } from "@/utils/help";
import dayjs from "dayjs";
import { CallingRecordsInfo } from "../callingRecords/const";

interface WorkOrderRecordsProps {
  userInfo: UserInfo;
}
const WorkOrderRecord: FC<WorkOrderRecordsProps> = ({ userInfo }) => {
  const [state, setState] = useCallBackState<WorkOrderRecords>({
    recordsSummary: {
      waitHandleCount: 0,
      waitFollowUpCount: 0,
      closedCount: 0,
    },
    current: "0",
    list: [],
    lastPage: false,
    startPage: 1,
    open: false,
    dataItem: {} as WorkOrderItemInfo,
    callRecords: [] as CallingRecordsInfo[],
  });
  const [form] = Form.useForm();
  const getAlertCount = async () => {
    const { data } = await get("/butlerAlertService/butlerAlertCount", {
      butlerUserId: userInfo?.id,
    });
    setState({
      recordsSummary: data || {
        waitHandleCount: 0,
        waitFollowUpCount: 0,
        closedCount: 0,
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
    const { items, lastPage } = await get("/butlerAlertService/page", {
      pageSize: 10,
      startPage: state.startPage,
      alertStatus: +state.current,
      userId: userInfo?.id,
    });
    setState({
      list: [...state.list, ...items],
      startPage: state.startPage + 1,
      lastPage: lastPage || true,
    });
  });

  const handleClick = (data: WorkOrderItemInfo) => {
    setState({
      open: true,
      dataItem: data,
    });
  };

  const handleSubmit = async () => {
    await form.validateFields();
    if (state.dataItem.alertStatus === 0) {
      await post("/butlerAlertService/handleAlert", {
        id: state.dataItem.id,
        handleRemark: form.getFieldValue("handleRemark"),
        callRecordIdList: form.getFieldValue("callRecordIdList"),
      });
    } else {
      await post("/butlerAlertService/handleFollowUp", {
        id: state.dataItem.id,
        handleRemark: form.getFieldValue("handleRemark"),
        callRecordIdList: form.getFieldValue("callRecordIdList"),
      });
    }
    setState({
      open: false,
      dataItem: {} as any,
    });
    loadMore();
  };

  const getCallingRecords = async (value?: string) => {
    const res = await get("/callRecordsService/withButlerUserCallRecord", {
      pageSize: 100,
      startPage: 1,
      butlerUserId: userInfo?.id,
      source: "workBench",
      ...(value && value.trim().length > 0 ? { id: value } : {}),
    });
    setState({
      callRecords: res.items,
    });
  };

  useEffect(() => {
    if (userInfo.id) {
      getAlertCount();
      loadMore();
      getCallingRecords();
    }
  }, [state.current, userInfo?.id]);

  return (
    <>
      {!state.open && (
        <div className={styles.page}>
          <div className={styles.header}>
            <img src={Icon1.src} className={styles.icon} />
            <div className={styles.text}>报警工单</div>
          </div>
          <div className={styles.content}>
            <div
              className="flex mb-[12px] overflow-x-auto whitespace-nowrap"
              style={{ height: 60 }}
            >
              <Radio.Group
                defaultValue="0"
                size="large"
                onChange={(e) => handleChangeTab(e.target.value)}
              >
                <Radio.Button value="0">
                  待处理（{state.recordsSummary.waitHandleCount}）
                </Radio.Button>
                <Radio.Button value="1">
                  待回访（{state.recordsSummary.waitFollowUpCount}）
                </Radio.Button>
                <Radio.Button value="2">
                  已关闭（{state.recordsSummary.closedCount}）
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
                    <div
                      className={styles.nomore}
                      style={{ textAlign: "center" }}
                    >
                      仅展示最近一个月工单记录~
                    </div>
                  }
                  scrollableTarget="scrollableDiv"
                >
                  {state.list.map((item) => (
                    <div key={item.id} style={{ marginBottom: 8 }}>
                      <WorkOrderItem
                        data={item}
                        onClick={(data) => handleClick(data)}
                      />
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
      )}
      {/* 处理阶段 */}
      {state.open && (
        <div className={styles.page}>
          <div className={styles.content}>
            <div
              className={styles.header}
              onClick={() => {
                setState({
                  open: false,
                  dataItem: {} as any,
                });
              }}
            >
              <img src={Icon2.src} className={styles.icon} />
              <div className={styles.text}>处理报警工单</div>
            </div>
            <div className={styles1.page}>
              <div className={styles1.header}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className={styles1.line}></div>
                  <div className={styles1.text}>
                    工单ID：{state.dataItem.id}
                  </div>
                </div>
                <div className={styles1.status}>
                  {DeviceTypeOptions[state.dataItem.deviceType]?.label}
                </div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>姓名：</div>
                <div className={styles1.info}>{state.dataItem.userName}</div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>性别：</div>
                <div className={styles1.info}>
                  {mapGenderName(state.dataItem.gender)}
                </div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>年龄：</div>
                <div className={styles1.info}>{state.dataItem.age || "-"}</div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>联系方式：</div>
                <div className={styles1.info}>
                  ({mapRelationName(state.dataItem.relation)})
                  {state.dataItem.phoneNumber}
                </div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>紧急联系人：</div>
                <div className={styles1.info}>
                  {state.dataItem.contactList
                    ?.map((i) => {
                      return (
                        <div key={i.id}>
                          ({mapRelationName(i.relation)}){i.phone}
                        </div>
                      );
                    })
                    .join(",") || "-"}
                </div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>地址：</div>
                <div className={styles1.info}>{state.dataItem.address}</div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>硬件名称：</div>
                <div className={styles1.info}>{state.dataItem.deviceName}</div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>报警时间：</div>
                <div className={styles1.info} style={{ color: "red" }}>
                  {dayjs(state.dataItem.alertTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>硬件设备号：</div>
                <div className={styles1.info}>{state.dataItem.deviceSn}</div>
              </div>
              <div className={styles1.flex}>
                <div className={styles1.label}>处理人：</div>
                <div className={styles1.info}>
                  {state.dataItem.handlerUserName || "-"}
                </div>
              </div>
              {state.dataItem.alertStatus !== 0 && (
                <div className={styles1.flex}>
                  <div className={styles1.label}>处理时长 ：</div>
                  <div className={styles1.info}>
                    {formatDurationToTime(state.dataItem.duration)}
                  </div>
                </div>
              )}
              <Form form={form} style={{ marginTop: 16 }}>
                <Form.Item label="处理记录" name="callRecordIdList">
                  <Select
                    mode="multiple"
                    placeholder="请选择处理记录"
                    optionLabelProp="label"
                    showSearch
                    onSearch={(value) => getCallingRecords(value)}
                  >
                    {state.callRecords.map((item) => (
                      <Select.Option
                        key={item.id}
                        value={item.id}
                        label={`通话记录ID：${item.id}`}
                      >
                        <div>
                          <div>通话记录ID：{item.id}</div>
                          <div>开始时间：{item.callStartTime}</div>
                          <div>结束时间：{item.callEndTime}</div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="处理说明"
                  name="handleRemark"
                  rules={[
                    { required: true, message: "请输入处理说明" },
                    { max: 20, message: "最多输入20个字" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="请输入处理说明"
                    maxLength={20}
                    showCount
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="w-full flex justify-end mb-[16px] ">
            <Button
              type="primary"
              className="w-[60px] mr-[16px]"
              onClick={() => handleSubmit()}
            >
              提交
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(WorkOrderRecord);
