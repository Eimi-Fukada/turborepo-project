"use client";

import { FC, useEffect } from "react";
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Form, message } from "antd";
import { post } from "@/request";
import { chronicDiseaseDict } from "@/enums/chronicDiseaseEnum";
import {
  BloodType,
  HealthStatus,
  mapBloodFatStatus,
  mapBloodPressureStatus,
  mapBloodSugarStatus,
  mapBloodType,
} from "@/enums/bloodEnum";
import { mapSelfCareAbility, SelfCareAbility } from "@/enums/selfCareEnum";
import { mapYesNoName, YesNo } from "@/enums/yesNoEnum";
import { enum2SelectOptions, obj2SelectOptions } from "@/utils/enumUtils";

interface ArchivesItem {
  allergicMedications: string;
  bloodLipid: HealthStatus;
  bloodPressure: HealthStatus;
  bloodSugar: HealthStatus;
  bloodType: BloodType;
  butlerUserId: number;
  chronicDisease: string[];
  drinking: YesNo;
  exerciseFrequency: number;
  height: number;
  id?: number;
  selfCareAbility: SelfCareAbility;
  smoking: YesNo;
  weight: number;
}

interface ArchivesEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: ArchivesItem;
  butlerUserId: string;
}

const defaultValues: Partial<ArchivesItem> = {
  allergicMedications: "",
  bloodLipid: HealthStatus.NORMAL,
  bloodPressure: HealthStatus.NORMAL,
  bloodSugar: HealthStatus.NORMAL,
  bloodType: BloodType.A,
  chronicDisease: [],
  drinking: YesNo.NO,
  exerciseFrequency: 0,
  height: 0,
  selfCareAbility: SelfCareAbility.SELF_CARE,
  smoking: YesNo.NO,
  weight: 0,
};

const ArchivesEdit: FC<ArchivesEditProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editData,
  butlerUserId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      // 如果有编辑数据，使用编辑数据，否则使用默认值
      form.setFieldsValue(editData || defaultValues);
    }
  }, [open, editData, form]);

  const handleFinish = async (values: ArchivesItem) => {
    const { result } = await post(
      editData?.id
        ? "/butlerUserService/editHealthArchive"
        : "/butlerUserService/addHealthArchive",
      {
      ...values,
      butlerUserId,
      id: editData?.id,
    });
    result === 0 && message.success(editData?.id ? "编辑成功" : "新建成功");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <ModalForm
      title="编辑健康档案"
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={600}
    >
      <ProFormGroup>
        <ProFormDigit
          name="height"
          label="身高"
          fieldProps={{ controls: false }}
          rules={[
            {
              type: "number",
              min: 100,
              max: 220,
              message: "请输入正常的身高范围：100cm~220cm",
            },
          ]}
          addonAfter="cm"
        />
        <ProFormDigit
          name="weight"
          label="体重"
          fieldProps={{ controls: false }}
          rules={[
            {
              type: "number",
              min: 30,
              max: 150,
              message: "请输入正常的体重范围：30kg~150kg",
            },
          ]}
          addonAfter="kg"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormSelect
          name="bloodPressure"
          label="血压"
          options={enum2SelectOptions(HealthStatus, mapBloodPressureStatus)}
        />
        <ProFormSelect
          name="bloodLipid"
          label="血脂"
          options={enum2SelectOptions(HealthStatus, mapBloodFatStatus)}
        />
        <ProFormSelect
          name="bloodSugar"
          label="血糖"
          options={enum2SelectOptions(HealthStatus, mapBloodSugarStatus)}
        />
      </ProFormGroup>

      <ProFormSelect
        name="chronicDisease"
        label="慢性病"
        mode="multiple"
        options={obj2SelectOptions(chronicDiseaseDict)}
      />

      <ProFormText name="allergicMedications" label="过敏药物" />

      <ProFormDigit
        name="exerciseFrequency"
        label="运动量"
        fieldProps={{ controls: false }}
        rules={[
          {
            type: "number",
            min: 0,
            max: 10,
            message: "请输入正常的运动量范围：0次/周~10次/周",
          },
        ]}
        addonAfter="次/周"
      />

      <ProFormRadio.Group
        name="bloodType"
        label="血型"
        options={enum2SelectOptions(BloodType, mapBloodType)}
      />

      <ProFormRadio.Group
        name="smoking"
        label="吸烟"
        options={enum2SelectOptions(YesNo, mapYesNoName)}
      />

      <ProFormRadio.Group
        name="drinking"
        label="饮酒"
        options={enum2SelectOptions(YesNo, mapYesNoName)}
      />

      <ProFormRadio.Group
        name="selfCareAbility"
        label="自理能力"
        options={enum2SelectOptions(SelfCareAbility, mapSelfCareAbility)}
      />
    </ModalForm>
  );
};

export default ArchivesEdit;
