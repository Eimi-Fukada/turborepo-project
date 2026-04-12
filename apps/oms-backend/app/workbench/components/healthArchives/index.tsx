"use client";

import React, { useMemo, useEffect, memo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Spin,
  Tooltip,
  App,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import {
  bloodPressureOptions,
  bloodLipidOptions,
  bloodSugarOptions,
  bloodTypeOptions,
  selfCareAbilityOptions,
} from "./const";
import { obj2SelectOptions } from "@/utils/enumUtils";
import { UserInfo } from "../../workbenchDetail/const";
import {
  mapBloodFatStatus,
  mapBloodPressureStatus,
  mapBloodSugarStatus,
  mapBloodType,
} from "@/enums/bloodEnum";
import {
  chronicDiseaseDict,
  getChronicDiseaseLabel,
} from "@/enums/chronicDiseaseEnum";
import { mapSelfCareAbility } from "@/enums/selfCareEnum";
import { post } from "@/request";
import EditIcon from "../../images/icon_edit.png";
import { useMethodStore } from "@/stores/useMethodStore";

interface HealthArchivesProps {
  archives: UserInfo["archives"];
}

const HealthArchives: React.FC<HealthArchivesProps> = ({ archives }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { triggerMethod } = useMethodStore();

  const [state, setState] = useCallBackState({
    isCollapse: false,
    edit: false,
  });

  const archivesList = useMemo(
    () => [
      {
        label: "身高：",
        info: (archives?.height ?? "-") + "cm",
      },
      {
        label: "体重：",
        info: (archives?.weight ?? "-") + "kg",
      },
      {
        label: "血压：",
        info: mapBloodPressureStatus(archives?.bloodPressure),
        color: archives?.bloodPressure === 1 ? "#21b748" : "#DC3545",
        needMark: true,
      },
      {
        label: "血脂：",
        info: mapBloodFatStatus(archives?.bloodLipid),
        color: archives?.bloodLipid === 1 ? "#21b748" : "#DC3545",
        needMark: true,
      },
      {
        label: "血糖：",
        info: mapBloodSugarStatus(archives?.bloodSugar),
        color: archives?.bloodSugar === 1 ? "#21b748" : "#DC3545",
        needMark: true,
      },
      {
        label: "慢性病：",
        info: getChronicDiseaseLabel(archives?.chronicDisease),
        needTooltip: true,
      },
      {
        label: "过敏药物：",
        info: archives?.allergicMedications,
        needTooltip: true,
      },
      {
        label: "血型：",
        info: mapBloodType(archives?.bloodType),
      },
      {
        label: "运动量：",
        info: (archives?.exerciseFrequency ?? "-") + "次/周",
      },
      {
        label: "吸烟：",
        info: archives?.smoking === 1 ? "是" : "否",
      },
      {
        label: "喝酒：",
        info: archives?.drinking === 1 ? "是" : "否",
      },
      {
        label: "能力：",
        info: mapSelfCareAbility(archives?.selfCareAbility),
      },
    ],
    [archives]
  );

  // 提交表单
  const [handleSubmit, submitLoading] = useSuperLock(async () => {
    const values = await form.validateFields();
    if (archives?.id) {
      await post("/butlerUserService/editHealthArchive", {
        ...values,
        id: archives.id,
        butlerUserId: archives.butlerUserId,
      });
    } else {
      await post("/butlerUserService/addHealthArchive", {
        ...values,
        butlerUserId: archives.butlerUserId,
      });
    }
    message.success("编辑成功");
    setState({ edit: false });
    triggerMethod("getWorkbenchUserInfo");
  });

  useEffect(() => {
    if (state.edit && archives?.id) {
      console.log("!!!@#321312", { ...archives });
      form.setFieldsValue({ ...archives });
    }
  }, [state.edit, archives]);

  return (
    <Spin spinning={submitLoading}>
      <div className={styles.header}>
        <div className={styles.flex}>
          <div className={styles.line}></div>
          <div className={styles.text}>健康档案</div>
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
      {!state.edit && Object.keys(archives || {}).length > 1 && (
        <div
          className={`${styles.content} ${state.isCollapse ? styles.content_scale : ""}`}
        >
          {archivesList.map((item) => (
            <div className={styles.item} key={item.label}>
              <div className={styles.label}>{item.label}</div>
              {item.needTooltip ? (
                <Tooltip title={item.info || "-"} placement="top">
                  <div className={styles.info}>{item.info || "-"}</div>
                </Tooltip>
              ) : !item.needMark ? (
                <div className={styles.info}>{item.info || "-"}</div>
              ) : (
                <div className={styles.info2}>
                  <div
                    className={styles.tip}
                    style={{ background: item.color }}
                  ></div>
                  <div style={{ color: item.color }}>{item.info}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!state.edit && Object.keys(archives || {}).length <= 1 && (
        <div
          className={`${styles.content} ${state.isCollapse ? styles.content_scale : ""}`}
          style={{ color: "#525459", fontSize: 14, marginTop: 12 }}
        >
          暂无相关信息
        </div>
      )}
      {state.edit && (
        <div className="mt-[12px]">
          <Form form={form} style={{ paddingRight: 32 }}>
            <Form.Item
              label="身高"
              name="height"
              rules={[
                {
                  type: "number",
                  min: 100,
                  max: 220,
                  message: "请输入正常的身高范围：100cm~220cm",
                },
              ]}
            >
              <InputNumber
                min={100}
                max={220}
                style={{ width: "100%" }}
                placeholder="请输入"
                addonAfter={<span className={styles.info_text}>cm</span>}
              />
            </Form.Item>
            <Form.Item
              label="体重"
              name="weight"
              rules={[
                {
                  type: "number",
                  required: false,
                  min: 30,
                  max: 150,
                  message: "请输入正常的体重范围：30kg~150kg",
                },
              ]}
            >
              <InputNumber
                min={30}
                max={150}
                style={{ width: "100%" }}
                placeholder="请输入"
                addonAfter={<span className={styles.info_text}>kg</span>}
              />
            </Form.Item>
            <Form.Item label="血压" name="bloodPressure">
              <Select options={bloodPressureOptions} placeholder="请选择" />
            </Form.Item>
            <Form.Item label="血脂" name="bloodLipid">
              <Select options={bloodLipidOptions} placeholder="请选择" />
            </Form.Item>
            <Form.Item label="血糖" name="bloodSugar">
              <Select options={bloodSugarOptions} placeholder="请选择" />
            </Form.Item>
            <Form.Item label="慢性病" name="chronicDisease">
              <Select
                mode="multiple"
                allowClear
                showSearch
                options={obj2SelectOptions(chronicDiseaseDict)}
                placeholder="请选择"
              />
            </Form.Item>
            <Form.Item
              label="运动量"
              name="exerciseFrequency"
              rules={[
                {
                  type: "number",
                  min: 0,
                  max: 10,
                  message: "请输入正常的运动量范围：0次/周~10次/周",
                  transform: (value) =>
                    value === "" ? undefined : Number(value),
                },
              ]}
            >
              <InputNumber
                min={0}
                max={10}
                style={{ width: "100%" }}
                placeholder="请输入"
                addonAfter={<span className={styles.info_text}> 次/周</span>}
              />
            </Form.Item>
            <Form.Item label="过敏药物" name="allergicMedications">
              <Input maxLength={40} allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item label="血型" name="bloodType">
              <Radio.Group>
                {bloodTypeOptions.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="吸烟" name="smoking">
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="喝酒" name="drinking">
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="能力" name="selfCareAbility">
              <Radio.Group>
                {selfCareAbilityOptions.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      )}
    </Spin>
  );
};

export default memo(HealthArchives);
