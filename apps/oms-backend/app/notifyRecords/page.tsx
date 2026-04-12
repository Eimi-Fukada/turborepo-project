"use client";

import { useCallBackState } from "@/hooks/useCallBackState";
import { get, post } from "@/request";
import {
  ActionType,
  ModalForm,
  ProForm,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, Form, message, Upload } from "antd";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { getAssetsUrl } from "@/utils/help";
import { hasBtnPermission } from "@/utils/permission";

export interface NotifyRecord {
  id?: number;
  title: string;
  content: string;
  pushType: number;
  notifyDeviceType: number;
  notifyScreenType: number;
  hasPushed?: number;
  createdAt?: string;
  pushedNum?: number;
  needPushNum?: number;
  type: number;
  mediaUrls?: string[];
  buttons?: {
    skipLink?: string;
    skipText?: string;
    skipType?: string;
  };
  pushTime?: string | number;
}

export default function NotifyPage() {
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState<{
    butlerUserList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
    modalOpen: boolean;
    modalType: "add" | "edit";
    currentRecord: any;
  }>({
    butlerUserList: [],
    tenantList: [],
    modalOpen: false,
    modalType: "add",
    currentRecord: undefined,
  });

  const [form] = Form.useForm();

  const getNotifyList = async (params) => {
    const res = await post("/notifyService/page", { ...params });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getSelectOptions = async () => {
    const [butlerUserData, tenantData] = await Promise.all([
      get("butlerUserService/listByMapping", {}),
      post("tenantQuery/tenantOptionList", {
        startPage: 1,
        pageSize: 100,
        includeCurrentTenant: true,
      }),
    ]);
    const butlerUserList = butlerUserData.data.map((i) => {
      return {
        value: i.id,
        label: i.userName,
      };
    });
    const tenantList = tenantData.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      butlerUserList: butlerUserList,
      tenantList,
    });
  };

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "seq",
      valueType: "index",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "通知ID",
      dataIndex: "id",
      align: "center",
      hideInSearch: true,
      hideInForm: true,
      hideInDetail: true,
    },
    {
      title: "通知标题",
      dataIndex: "title",
      align: "center",
    },
    {
      title: "通知进度",
      dataIndex: "pushedNum",
      align: "center",
      hideInSearch: true,
      render: (_, record) => (
        <>{(record.pushedNum || 0) + "/" + (record.needPushNum || 0)}</>
      ),
    },
    {
      title: "通知类型",
      dataIndex: "pushType",
      align: "center",
      valueEnum: {
        1: { text: "实时通知" },
        3: { text: "定时通知" },
      },
      fieldProps: {
        options: [
          { label: "全部", value: "" },
          { label: "实时通知", value: "1" },
          { label: "定时通知", value: "3" },
        ],
      },
      render: (_, record) => (
        <>{record.pushType === 1 ? "实时通知" : "定时通知"}</>
      ),
    },
    {
      title: "通知目标",
      dataIndex: "tenantId",
      align: "center",
      width: 150,
      fieldProps: {
        options: state.tenantList,
      },
      render: (_, record) => {
        return (
          <div>
            {getRelatedUserList(
              record.notifyDeviceType,
              record.receiverIds || [],
              record.receiverNames
            )}
          </div>
        );
      },
    },
    {
      title: "通知时间",
      dataIndex: "starttime",
      align: "center",
      hideInSearch: true,
      render: (_, record) => <>{record.starttime || "-"}</>,
    },
    {
      title: "展现方式",
      dataIndex: "notifyScreenType",
      align: "center",
      hideInTable: true,
      hideInSearch: true,
      hideInForm: true,
      render: (_, record) => (record.notifyScreenType === 0 ? "全屏" : "半屏"),
    },
    {
      title: "通知内容",
      dataIndex: "content",
      align: "center",
      hideInTable: true,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: "跳转按钮",
      dataIndex: "buttons",
      align: "center",
      hideInTable: true,
      hideInSearch: true,
      hideInForm: true,
      render: (_, record) =>
        record.buttons?.skipText === undefined
          ? "无"
          : record.buttons?.skipText,
    },
    {
      title: "链接地址",
      dataIndex: "buttons",
      align: "center",
      hideInTable: true,
      hideInSearch: true,
      hideInForm: true,
      render: (_, record) =>
        record.buttons?.skipLink === undefined
          ? "无"
          : record.buttons?.skipLink,
    },
  ];

  const getRelatedUserList = (
    type: number,
    userList1: number[],
    receverUserNames: string
  ) => {
    if (type === 1) {
      const tenantNameList: string[] = [];
      userList1.forEach((item) => {
        state.tenantList.forEach((tenant) => {
          if (String(item) === String(tenant.value)) {
            const tenantName = tenant.label;
            tenantNameList.push(tenantName);
          }
        });
      });
      return "指定租户：" + tenantNameList.join(" , ");
    } else if (type === 2) {
      return "指定用户：" + receverUserNames;
    } else {
      return "未知";
    }
  };

  useEffect(() => {
    getSelectOptions();
  }, []);

  const getInitialValues = () => {
    if (state.modalType === "edit" && state.currentRecord?.id) {
      const fileList = (url: string) =>
        url
          ? [
              {
                url,
                name: url.split("/").pop(),
                uid: Date.now() + Math.random(),
                status: "done",
                thumbUrl: url,
              },
            ]
          : [];

      // 获取第一个媒体URL
      const mediaUrl = state.currentRecord.mediaUrls?.[0];

      return {
        title: state.currentRecord.title,
        notifyDeviceType: state.currentRecord.notifyDeviceType,
        receiverTenantIds:
          state.currentRecord.notifyDeviceType === 1
            ? state.currentRecord.receiverIds
            : [],
        receiverIds:
          state.currentRecord.notifyDeviceType === 2
            ? state.currentRecord.receiverIds
            : [],
        notifyScreenType: state.currentRecord.notifyScreenType,
        pushType: state.currentRecord.pushType,
        pushTime: state.currentRecord.pushTime
          ? dayjs(+state.currentRecord.pushTime)
          : undefined,
        type: state.currentRecord.type,
        content: state.currentRecord.content,
        // 根据不同类型设置对应的媒体文件
        picture: state.currentRecord.type === 17 ? fileList(mediaUrl) : [],
        audio: state.currentRecord.type === 20 ? fileList(mediaUrl) : [],
        video: state.currentRecord.type === 18 ? fileList(mediaUrl) : [],
        url: state.currentRecord.type === 19 ? mediaUrl || "" : "",
        jumpType: state.currentRecord.buttons?.skipType ? 2 : 0,
        jumpButtonName: state.currentRecord.buttons?.skipText || "",
        jumpUrl: state.currentRecord.buttons?.skipLink || "",
      };
    }

    // 新建时默认值
    return {
      notifyDeviceType: 1,
      pushType: 1,
      notifyScreenType: 0,
      type: 16,
      jumpType: 0,
    };
  };

  const resetModal = () => {
    form.resetFields();
    setState({
      modalOpen: false,
      modalType: "add",
      currentRecord: undefined,
    });
  };

  const handleAdd = () => {
    resetModal();
    setState({
      modalOpen: true,
      modalType: "add",
      currentRecord: undefined,
    });
  };

  const handleEdit = (record: NotifyRecord) => {
    resetModal();
    setState({
      modalOpen: true,
      modalType: "edit",
      currentRecord: record,
    });
  };

  const handleFinish = async (values) => {
    // 1. 上传文件到阿里云，获取 mediaUrls
    let mediaUrls: string[] = [];
    // 伪代码：根据 type 判断需要上传的文件类型
    if (
      values.type === 17 &&
      Array.isArray(values.picture) &&
      values.picture.length > 0
    ) {
      // 左文右图，上传图片
      mediaUrls = await getAssetsUrl(values.picture);
    } else if (
      values.type === 20 &&
      Array.isArray(values.audio) &&
      values.audio.length > 0
    ) {
      // 音频
      mediaUrls = await getAssetsUrl(values.audio);
    } else if (
      values.type === 18 &&
      Array.isArray(values.video) &&
      values.video.length > 0
    ) {
      // 视频
      mediaUrls = await getAssetsUrl(values.video);
    }
    let jumpParams: any = {};
    // 纯文字无需上传，mediaUrls 为空
    if (values.jumpType === 0) {
      jumpParams = {};
    } else if (values.jumpType === 1) {
      jumpParams = {
        jumpButtonName: values.jumpButtonName,
        jumpUrlResource: {
          path: "",
          resourceId: "",
          resourceSetId: "",
          resourceTitle: "",
          skillId: "",
          skillKey: "",
        },
      };
    } else if (values.jumpType === 2) {
      jumpParams = {
        jumpButtonName: values.jumpButtonName,
        jumpUrl: values.jumpUrl,
      };
    }
    // 2. 组装推送参数
    const pushParams =
      values.pushType === 1
        ? { pushType: values.pushType }
        : {
            pushType: values.pushType,
            pushTime: dayjs(values.pushTime).valueOf(),
          };

    // 3. 组装最终表单参数
    const formValue = {
      title: values.title,
      notifyDeviceType: values.notifyDeviceType,
      receiverIds:
        values.notifyDeviceType === 1
          ? values.receiverTenantIds
          : values.receiverIds,
      notifyScreenType: values.notifyScreenType,
      ...pushParams,
      ...jumpParams,
      type: values.type,
      content: values.content,
      mediaUrls: values.type === 16 ? [] : mediaUrls,
      jumpType: values.jumpType,
      pushFrequency: 0,
      source: 0,
    };

    // 4. 提交到后端
    const res = await post("/notifyService", formValue);
    if (res.result === 0) {
      message.success("处理成功");
    } else {
      message.error(res.resultMessage);
    }
    actionRef.current?.reload();
  };

  // 权限判断
  const canCreate = hasBtnPermission("/notifyRecords:add");
  const canView = hasBtnPermission("/notifyRecords/notifyRecordsDetail:detail");
  const canEdit = hasBtnPermission(
    "/notifyRecords/notifyRecordsReinform:again"
  );

  // 预览区获取资源src
  const getAssetsSrc = (file) => {
    if (!file) return "";
    if (file.url) return file.url;
    if (file.response && file.response.url) return file.response.url;
    if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
    return "";
  };

  // 监听表单值
  const formValues = Form.useWatch([], form) || {};

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        expandButtonProps={(record) => ({
          hideDetailAction: !canView,
        })}
        request={getNotifyList}
        expandActionRender={(record: NotifyRecord) =>
          [
            canEdit && (
              <Button
                key="edit"
                color="primary"
                variant="filled"
                onClick={() => handleEdit(record)}
              >
                再次通知
              </Button>
            ),
          ].filter(Boolean)
        }
        expandToolBarRender={() =>
          [
            canCreate && (
              <Button type="primary" onClick={handleAdd}>
                新建通知
              </Button>
            ),
          ].filter(Boolean)
        }
      />
      <ModalForm
        form={form}
        preserve={false}
        title={state.modalType === "add" ? "新建通知" : "再次通知"}
        open={state.modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetModal();
          }
        }}
        initialValues={getInitialValues()}
        onFinish={handleFinish}
        width={900}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          keyboard: false,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ProFormText
              name="title"
              label="标题"
              placeholder="请输入标题"
              rules={[{ required: true, message: "请输入标题" }]}
            />
            <ProFormRadio.Group
              name="notifyDeviceType"
              label="通知范围"
              options={[
                { label: "指定租户", value: 1 },
                { label: "指定用户", value: 2 },
              ]}
            />
            <ProFormDependency name={["notifyDeviceType"]}>
              {({ notifyDeviceType }) =>
                notifyDeviceType === 1 ? (
                  <ProFormSelect
                    name="receiverTenantIds"
                    label="指定租户"
                    mode="multiple"
                    options={state.tenantList}
                    rules={[{ required: true, message: "请选择租户" }]}
                  />
                ) : notifyDeviceType === 2 ? (
                  <ProFormSelect
                    name="receiverIds"
                    label="指定用户"
                    mode="multiple"
                    options={state.butlerUserList}
                    rules={[{ required: true, message: "请选择用户" }]}
                  />
                ) : null
              }
            </ProFormDependency>
            <ProFormRadio.Group
              name="notifyScreenType"
              label="展现方式"
              options={[
                { label: "全屏", value: 0 },
                { label: "半屏", value: 1 },
              ]}
            />
            <ProFormRadio.Group
              name="pushType"
              label="通知类型"
              options={[
                { label: "实时", value: 1 },
                { label: "定时", value: 3 },
              ]}
            />
            <ProFormDependency name={["pushType"]}>
              {({ pushType }) =>
                pushType === 3 ? (
                  <ProFormDateTimePicker
                    name="pushTime"
                    label="通知时间"
                    rules={[{ required: true, message: "请选择通知时间" }]}
                  />
                ) : null
              }
            </ProFormDependency>
            <ProFormRadio.Group
              name="type"
              label="通知形式"
              options={[
                { label: "文字", value: 16 },
                { label: "左文右图", value: 17 },
                { label: "音频", value: 20 },
                { label: "视频", value: 18 },
                { label: "链接", value: 19 },
              ]}
            />
            <ProFormDependency name={["type"]}>
              {({ type }) =>
                type === 16 || type === 17 ? (
                  <ProFormTextArea
                    name="content"
                    label="通知内容"
                    placeholder="请输入通知内容"
                    rules={[{ required: true, message: "请输入通知内容" }]}
                    fieldProps={{ maxLength: 200 }}
                  />
                ) : null
              }
            </ProFormDependency>
            {/* 图片上传（左文右图） */}
            <ProFormDependency name={["type"]}>
              {({ type }) =>
                type === 17 ? (
                  <ProForm.Item
                    name="picture"
                    label="图片"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      //这里直接返回fileList吧，实际处理的也是这个
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                    rules={[{ required: true, message: "请上传图片" }]}
                  >
                    <Upload
                      listType="picture-card"
                      accept="image/*"
                      beforeUpload={(file) => {
                        if (file.size / 1024 / 1024 > 10) {
                          message.error("图片大小不能超过10M");
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      }}
                      maxCount={1}
                    >
                      <div>上传</div>
                    </Upload>
                  </ProForm.Item>
                ) : null
              }
            </ProFormDependency>
            {/* 音频上传 */}
            <ProFormDependency name={["type"]}>
              {({ type }) =>
                type === 20 ? (
                  <ProForm.Item
                    name="audio"
                    label="音频"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                    rules={[{ required: true, message: "请上传音频" }]}
                  >
                    <Upload
                      listType="text"
                      accept=".mp3,.wav,.ogg"
                      beforeUpload={(file) => {
                        if (file.size / 1024 / 1024 > 10) {
                          message.error("音频大小不能超过10M");
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      }}
                      maxCount={1}
                      itemRender={(originNode, file) => {
                        return (
                          <div style={{ marginTop: 8 }}>
                            {file.status === "done" && file.url ? (
                              <div>
                                <audio
                                  controls
                                  src={file.url}
                                  style={{ width: "100%", maxWidth: 300 }}
                                >
                                  您的浏览器不支持 audio 元素。
                                </audio>
                              </div>
                            ) : (
                              originNode
                            )}
                          </div>
                        );
                      }}
                    >
                      <Button>上传音频</Button>
                    </Upload>
                  </ProForm.Item>
                ) : null
              }
            </ProFormDependency>
            {/* 视频上传 */}
            <ProFormDependency name={["type"]}>
              {({ type }) =>
                type === 18 ? (
                  <ProForm.Item
                    name="video"
                    label="视频"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                    rules={[{ required: true, message: "请上传视频" }]}
                  >
                    <Upload
                      listType="text"
                      accept=".mp4,.mov,.avi,.mkv"
                      beforeUpload={(file) => {
                        if (file.size / 1024 / 1024 > 10) {
                          message.error("视频大小不能超过10M");
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      }}
                      maxCount={1}
                      itemRender={(originNode, file) => {
                        return (
                          <div style={{ marginTop: 8 }}>
                            {file.status === "done" && file.url ? (
                              <div>
                                <video
                                  controls
                                  src={file.url}
                                  style={{
                                    width: "100%",
                                    maxWidth: 400,
                                    borderRadius: 8,
                                  }}
                                >
                                  您的浏览器不支持视频播放
                                </video>
                              </div>
                            ) : (
                              originNode
                            )}
                          </div>
                        );
                      }}
                    >
                      <Button>上传视频</Button>
                    </Upload>
                  </ProForm.Item>
                ) : null
              }
            </ProFormDependency>
            <ProFormDependency name={["type"]}>
              {({ type }) =>
                type === 19 ? (
                  <ProFormText
                    name="url"
                    label="网址"
                    placeholder="请输入网址"
                    fieldProps={{ maxLength: 200 }}
                    rules={[{ required: true, message: "请输入网址" }]}
                  />
                ) : null
              }
            </ProFormDependency>
            <ProFormRadio.Group
              name="jumpType"
              label="跳转类型"
              options={[
                { label: "无", value: 0 },
                { label: "技能按钮", value: 1 },
                { label: "普通链接", value: 2 },
              ]}
            />
            <ProFormDependency name={["jumpType"]}>
              {({ jumpType }) =>
                jumpType === 1 ? (
                  <ProFormText
                    name="jumpButtonName"
                    label="跳转按钮"
                    rules={[{ required: true, message: "请输入按钮名称" }]}
                  />
                ) : null
              }
            </ProFormDependency>
            <ProFormDependency name={["jumpType"]}>
              {({ jumpType }) =>
                jumpType === 2 ? (
                  <ProFormText
                    name="jumpUrl"
                    label="跳转链接"
                    rules={[{ required: true, message: "请输入链接地址" }]}
                  />
                ) : null
              }
            </ProFormDependency>
          </div>
          {/* 预览区，仅新建时显示 */}
          {!state.currentRecord?.id && (
            <div style={{ marginLeft: 50, flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>预览图:</div>
              <div
                className="preview-content"
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 16,
                  background: "#fafbfc",
                  minHeight: 320,
                }}
              >
                <div
                  className="preview-title"
                  style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}
                >
                  {formValues.title}
                </div>
                {/* 左文右图横向排布 */}
                {formValues.type === 17 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      minHeight: 180,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        marginRight: 16,
                        wordBreak: "break-all",
                        maxWidth: "60%",
                      }}
                    >
                      {formValues.content && (
                        <div style={{ marginBottom: 8 }}>
                          {formValues.content}
                        </div>
                      )}
                    </div>
                    {Array.isArray(formValues.picture) &&
                      formValues.picture.length > 0 && (
                        <img
                          src={getAssetsSrc(formValues.picture[0])}
                          style={{
                            height: 180,
                            maxWidth: 160,
                            borderRadius: 6,
                            objectFit: "cover",
                            boxShadow: "0 2px 8px #eee",
                          }}
                        />
                      )}
                  </div>
                )}
                {/* 其他类型上下排布 */}
                {formValues.type !== 17 && (
                  <div className="preview-assets" style={{ marginBottom: 12 }}>
                    {/* 文字内容 */}
                    {formValues.content && formValues.type === 16 && (
                      <div style={{ marginBottom: 8 }}>
                        {formValues.content}
                      </div>
                    )}
                    {/* 图片 */}
                    {Array.isArray(formValues.picture) &&
                      formValues.picture.length > 0 &&
                      formValues.type === 17 && (
                        <img
                          src={getAssetsSrc(formValues.picture[0])}
                          style={{
                            height: 180,
                            marginBottom: 8,
                            maxWidth: "100%",
                          }}
                        />
                      )}
                    {/* 音频 */}
                    {Array.isArray(formValues.audio) &&
                      formValues.audio.length > 0 &&
                      formValues.type === 20 && (
                        <audio
                          controls
                          src={getAssetsSrc(formValues.audio[0])}
                          style={{ width: 320, height: 60, marginBottom: 8 }}
                        >
                          您的浏览器不支持 audio 元素。
                        </audio>
                      )}
                    {/* 视频 */}
                    {Array.isArray(formValues.video) &&
                      formValues.video.length > 0 &&
                      formValues.type === 18 && (
                        <video
                          controls
                          autoPlay
                          src={getAssetsSrc(formValues.video[0])}
                          style={{ width: 320, marginBottom: 8 }}
                        >
                          您的浏览器不支持视频播放
                        </video>
                      )}
                  </div>
                )}
                {/* 跳转按钮名 */}
                {formValues.jumpButtonName && (
                  <div
                    className="preview-button"
                    style={{
                      marginTop: 12,
                      color: "#1677ff",
                      fontWeight: 500,
                    }}
                  >
                    {formValues.jumpButtonName}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalForm>
    </>
  );
}
