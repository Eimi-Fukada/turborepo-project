"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Upload,
  Cascader,
  Spin,
  App,
} from "antd";
import { PlusOutlined, DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./index.module.css";
import { findCascaderPath, getAssetsUrl, listToTree } from "@/utils/help";
import { useCallBackState } from "@/hooks/useCallBackState";
import { UserInfo } from "../../workbenchDetail/const";
import { get, put } from "@/request";
import { mapGenderName } from "@/enums/genderEnum";
import { useSuperLock } from "@/hooks/useSuperLock";
import { genderOptions, phoneRelationOptions } from "./const";
import EditIcon from "../../images/icon_edit.png";

interface UserBaseInfoProps {
  userInfo: UserInfo;
}

const UserBaseInfo: React.FC<UserBaseInfoProps> = ({ userInfo }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [state, setState] = useCallBackState({
    edit: false,
    isCollapse: false,
    regionList: [] as { label: string; value: string }[],
    regionCascaderList: [] as any[],
  });
  const [fileList, setFileList] = useState<any[]>(
    form.getFieldValue("avatar") || []
  );

  // 上传前校验
  const beforeUpload = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      message.warning("文件大小不能超过20M");
      return Upload.LIST_IGNORE;
    }
    return true;
  };
  const getRegionList = async () => {
    const { data } = await get("/regionQuery/list");
    setState({
      regionList: data?.map((i) => {
        return {
          label: i?.provinceName + i?.cityName + i?.name,
          value: i.code,
        };
      }),
      regionCascaderList: listToTree(data, {
        id: "code",
        children: "children",
        pid: "parentCode",
      }),
    });
  };

  // 获取城市名
  const getRegionName = (cityCode: string) => {
    return state.regionList.find((i) => i.value === cityCode)?.label;
  };

  // 展示信息列表
  const userInfoList = useMemo(
    () => [
      { label: "姓名：", info: userInfo?.userName },
      { label: "性别：", info: mapGenderName(userInfo.gender) },
      { label: "出生日期：", info: userInfo?.birthday },
      { label: "身份证号：", info: userInfo?.idCard },
      { label: "联系电话：", info: userInfo?.phoneNumber },
      { label: "所属城市：", info: getRegionName(userInfo?.city) },
      { label: "详细地址：", info: userInfo?.address },
      { label: "所属街道：", info: userInfo?.street },
      { label: "居委电话：", info: userInfo?.committeePhone },
      { label: "是否独居：", info: userInfo?.liveAlone === 1 ? "是" : "否" },
      { label: "创建时间：", info: userInfo?.createTime },
    ],
    [userInfo, state.regionList]
  );

  const setDefaultValue = () => {
    if (userInfo?.id && state.regionCascaderList.length > 0) {
      form.setFieldsValue({
        userName: userInfo.userName,
        avatar: userInfo.avatar
          ? [
              {
                url: userInfo.avatar,
                name: userInfo.avatar?.split("/").pop(),
                uid: new Date().getTime(),
                status: "done",
              },
            ]
          : [],
        gender: userInfo.gender,
        birthday: userInfo.birthday ? dayjs(userInfo.birthday) : undefined,
        idCard: userInfo.idCard,
        phoneRelation: userInfo.phoneRelation,
        phoneNumber: userInfo.phoneNumber,
        city: findCascaderPath(state.regionCascaderList, userInfo.city),
        address: userInfo.address,
        street: userInfo.street,
        committeePhone: userInfo.committeePhone,
        liveAlone: userInfo.liveAlone ?? 1,
      });
      setFileList(
        userInfo.avatar
          ? [
              {
                url: userInfo.avatar,
                name: userInfo.avatar?.split("/").pop(),
                uid: new Date().getTime(),
                status: "done",
              },
            ]
          : []
      );
    }
  };

  useEffect(() => {
    getRegionList();
  }, []);

  useEffect(() => {
    setDefaultValue();
  }, [userInfo, state.regionCascaderList]);

  // 提交表单
  const [handleSubmit, submitLoading] = useSuperLock(async () => {
    const values = await form.validateFields();
    const assets = await getAssetsUrl(values.avatar);
    const cityCode = Array.isArray(values.city)
      ? values.city[values.city.length - 1]
      : values.city;
    const params = {
      ...values,
      avatar: assets,
      id: userInfo.id,
      birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : "",
      city: cityCode,
    };
    await put("/butlerUserService/update", params);
    message.success("编辑成功");
    setState({ edit: false });
  });

  return (
    <Spin spinning={submitLoading}>
      <div className={styles.header}>
        <div className={styles.flex}>
          <div className={styles.line}></div>
          <div className={styles.text}>基本信息</div>
        </div>
        <div className={styles.flex}>
          {!state.edit ? (
            <>
              <div
                className={styles.edit_content}
                onClick={() => setState({ edit: true })}
              >
                <img src={EditIcon.src} className={styles.edit_icon} />
                <div className={styles.edit_text}>编辑</div>
              </div>
              <DownOutlined
                className={`${styles.down_icon} ${state.isCollapse ? styles.rotate : ""}`}
                onClick={() => setState({ isCollapse: !state.isCollapse })}
              />
            </>
          ) : (
            <div className={styles.flex}>
              <div className={styles.btn_content} onClick={handleSubmit}>
                保存
              </div>
              <div
                className={styles.btn_content}
                style={{ color: "#525459" }}
                onClick={() => setState({ edit: false })}
              >
                取消
              </div>
            </div>
          )}
        </div>
      </div>
      {!state.edit && (
        <div
          className={`${styles.content} ${state.isCollapse ? styles.content_scale : ""}`}
        >
          {userInfoList.map((item) => (
            <div className={styles.item} key={item.label}>
              <div className={styles.label}>{item.label}</div>
              <div className={styles.info}>{item.info || "-"}</div>
            </div>
          ))}
        </div>
      )}
      {state.edit && (
        <div className={styles.form_content}>
          <Form
            form={form}
            initialValues={{ liveAlone: 1 }}
            style={{ paddingRight: 32 }}
          >
            <Form.Item
              label="头像"
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
              rules={[{ required: true, message: "请选择头像" }]}
            >
              <div className="flex items-center">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={beforeUpload}
                  accept=".jpg,.jpeg,.png"
                  showUploadList={{ showPreviewIcon: false }}
                  fileList={fileList}
                  onChange={({ fileList: newFileList }) => {
                    setFileList(newFileList);
                    form.setFieldsValue({ avatar: newFileList });
                  }}
                >
                  {fileList.length < 1 && (
                    <div className={styles.upload_content}>
                      <PlusOutlined />
                      <div className={styles.upload_text}>上传头像</div>
                    </div>
                  )}
                </Upload>
                <span className={styles.upload_info}>
                  仅支持jpg、jpeg、png图片格式文件不大于20M
                </span>
              </div>
            </Form.Item>
            <Form.Item
              label="姓名"
              name="userName"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input maxLength={20} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item label="性别" name="gender">
              <Select placeholder="请选择" options={genderOptions} />
            </Form.Item>
            <Form.Item label="出生日期" name="birthday">
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="身份证号"
              name="idCard"
              rules={[
                {
                  pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                  message: "请输入有效的身份证号",
                },
              ]}
            >
              <Input maxLength={18} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item label="联系电话" required style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Form.Item
                  name="phoneRelation"
                  rules={[{ required: true, message: "请选择关系" }]}
                  style={{ flex: "0 0 30%" }}
                >
                  <Select options={phoneRelationOptions} placeholder="关系" />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "请输入联系电话" },
                    {
                      pattern: /^1[3-9]\d{9}$/,
                      message: "请输入有效的手机号码",
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <Input maxLength={11} allowClear placeholder="请输入" />
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item
              label="所属城市"
              name="city"
              rules={[{ required: true, message: "请选择城市" }]}
            >
              <Cascader
                options={state.regionCascaderList}
                fieldNames={{
                  label: "name",
                  value: "code",
                  children: "children",
                }}
                placeholder="请选择"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="详细地址"
              name="address"
              rules={[{ required: true, message: "请输入详细地址" }]}
            >
              <Input maxLength={32} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="所属街道"
              name="street"
              rules={[{ required: true, message: "请输入所属街道" }]}
            >
              <Input maxLength={32} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="居委电话"
              name="committeePhone"
              rules={[
                {
                  pattern: /^[0-9-]{1,18}$/,
                  message: "请输入有效的居委电话",
                },
              ]}
            >
              <Input maxLength={18} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item label="是否独居" name="liveAlone">
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      )}
    </Spin>
  );
};

export default UserBaseInfo;
