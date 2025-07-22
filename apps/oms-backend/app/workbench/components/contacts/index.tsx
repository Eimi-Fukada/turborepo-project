"use client";

import React, { useEffect, useMemo } from "react";
import { Table, Form, Input, Select, Radio, Spin, Tooltip, App } from "antd";
import { PlusOutlined, DownOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { useMethodStore } from "@/stores/useMethodStore";
import { post } from "@/request";
import { UserInfo } from "../../workbenchDetail/const";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { relationOptions } from "../userBaseInfo/const";
import EditIcon from "../../images/icon_edit.png";
import Icon1 from "./images/icon1.png";

interface ContactsProps {
  contacts: UserInfo["contacts"];
  butlerUserId: string;
}

const MAX_CONTACTS = 3;

const Contacts: React.FC<ContactsProps> = ({ contacts, butlerUserId }) => {
  const { message } = App.useApp();
  const { triggerMethod } = useMethodStore();

  // 统一管理状态
  const [state, setState] = useCallBackState({
    isCollapse: false,
    edit: false,
    formList: [] as any[],
  });

  // 展示表格数据
  const tableData = useMemo(
    () =>
      (contacts || []).map((i) => ({
        ...i,
        gender: mapGenderName(i.gender),
        relation: mapRelationName(i.relation),
      })),
    [contacts]
  );

  // 编辑表单数据
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      setState({
        formList: contacts.map((item) => ({
          ...item,
          guid: "guid" + Math.random(),
        })),
      });
    } else {
      setState({ formList: [] });
    }
  }, [contacts]);

  // 校验规则
  const rules = {
    name: [{ required: true, message: "请输入姓名" }],
    gender: [{ required: true, message: "请选择性别" }],
    phone: [
      { required: true, message: "请输入联系方式" },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码" },
    ],
    relation: [{ required: true, message: "请选择关系" }],
  };

  // 新增联系人
  const handleAdd = () => {
    if (state.formList.length >= MAX_CONTACTS) return;
    setState({
      formList: [
        ...state.formList,
        {
          gender: 1,
          name: "",
          phone: "",
          relation: 1,
          guid: "guid" + Math.random(),
        },
      ],
    });
  };

  // 删除联系人
  const handleDel = (guid: string) => {
    setState({
      formList: state.formList.filter((i) => i.guid !== guid),
    });
  };

  // 提交
  const [handleSubmit, submitLoading] = useSuperLock(async () => {
    // 校验所有表单
    let isValid = true;
    for (const item of state.formList) {
      if (!item.name || !item.gender || !item.phone || !item.relation) {
        isValid = false;
        message.warning("请填写完整信息");
        break;
      }
      if (!/^1[3-9]\d{9}$/.test(item.phone)) {
        isValid = false;
        message.warning("请输入有效的手机号码");
        break;
      }
    }
    if (!isValid) return;

    const params = {
      butlerUserId,
      list: state.formList.map(({ guid, ...rest }) => rest),
    };
    await post("/butlerUserService/updateEmergencyContactById", params);
    message.success("编辑成功");
    setState({ edit: false });
    triggerMethod("getWorkbenchUserInfo");
  });

  return (
    <Spin spinning={submitLoading}>
      <div className={styles.header}>
        <div className={styles.flex}>
          <div className={styles.line}></div>
          <div className={styles.text}>紧急联系人</div>
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
          <Table
            dataSource={tableData}
            rowKey="phone"
            pagination={false}
            style={{ marginTop: 12 }}
            columns={[
              { title: "姓名", dataIndex: "name", key: "name" },
              { title: "性别", dataIndex: "gender", key: "gender" },
              { title: "关系", dataIndex: "relation", key: "relation" },
              { title: "联系方式", dataIndex: "phone", key: "phone" },
            ]}
          />
        </div>
      )}
      {state.edit && (
        <div style={{ marginTop: 12 }}>
          {state.formList.map((item, index) => (
            <div className={styles.card_item} key={item.guid}>
              <div className={styles.card_item_header}>
                <div className={styles.text}>紧急联系人-{index + 1}</div>
                <img
                  className={styles.del_icon}
                  onClick={() => handleDel(item.guid)}
                  src={Icon1.src}
                />
              </div>
              <div className="mt-[12px] pl-[10px] pr-[20px]">
                <Form
                  initialValues={item}
                  onValuesChange={(changed, all) => {
                    // 实时同步到 state.formList
                    setState({
                      formList: state.formList.map((f, idx) =>
                        idx === index ? { ...f, ...changed } : f
                      ),
                    });
                  }}
                >
                  <Form.Item label="姓名" name="name" rules={rules.name}>
                    <Input maxLength={10} allowClear placeholder="请输入" />
                  </Form.Item>
                  <Form.Item label="性别" name="gender" rules={rules.gender}>
                    <Radio.Group>
                      <Radio value={1}>男</Radio>
                      <Radio value={2}>女</Radio>
                      <Radio value={0}>未知</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="联系方式" name="phone" rules={rules.phone}>
                    <Input maxLength={11} allowClear placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    label="关系"
                    name="relation"
                    rules={rules.relation}
                  >
                    <Select options={relationOptions} placeholder="请选择" />
                  </Form.Item>
                </Form>
              </div>
            </div>
          ))}
          {state.formList.length < MAX_CONTACTS && (
            <div className={styles.add_content} onClick={handleAdd}>
              <PlusOutlined className={styles.add_icon} />
              <div>新增</div>
            </div>
          )}
        </div>
      )}
    </Spin>
  );
};

export default Contacts;
