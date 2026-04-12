"use client";
import { mapGenderName } from "@/enums/genderEnum";
import { mapRelationName } from "@/enums/relationEnum";
import { useCallBackState } from "@/hooks/useCallBackState";
import { del, get, post } from "@/request";
import { exportFile, findNode, listToTree } from "@/utils/help";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button, message } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BindAgent from "./components/BindAgent";
import BindDevice from "./components/BindDevice";
import { ActionType } from "@ant-design/pro-components";
import Write from "./components/Write";
import {
  DeviceType,
  DeviceStatus,
  mapDeviceStatusName,
} from "@/enums/deviceEnum";
import { Combo, mapComboName } from "@/enums/comboEnum";
import { enum2SelectOptions, enum2ValueEnum } from "@/utils/enumUtils";
import { useSuperLock } from "@/hooks/useSuperLock";
import { useUserStore } from "@/stores/useUserStore";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionRef = useRef<ActionType>(null);
  const [state, setState] = useCallBackState({
    tenantList: [] as { label: string; value: string }[],
    regionTree: [] as any[],
    agentList: [] as { label: string; value: string }[],
    writeVisible: false,
    bindAgentVisible: false,
    bindDeviceVisible: false,
    editData: undefined,
    selectedRecord: undefined as any,
  });

  // 权限判断
  const canCreate = hasBtnPermission("butlerUserService:add");
  const canExport = hasBtnPermission("butlerUserService:export");
  const canImport = hasBtnPermission("butlerUserService:import");
  const canDetail = hasBtnPermission("butlerUserService:detail");
  const canBindAgent = hasBtnPermission("butlerUserService:bindAgent");
  const canBindDevice = hasBtnPermission("butlerUserService:bindDevice");

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "用户姓名",
      dataIndex: "userName",
    },
    {
      title: "年龄",
      dataIndex: "age",
      search: false,
    },
    {
      title: "性别",
      dataIndex: "gender",
      search: false,
      renderText(text, record, index, action) {
        return <>{mapGenderName(record.gender)}</>;
      },
    },
    {
      title: "联系电话",
      dataIndex: "phoneNumber",
      search: false,
      renderText(text, record, index, action) {
        const phoneRelationName = mapRelationName(record?.phoneRelation) || "";
        const phoneNumber =
          (phoneRelationName ? phoneRelationName + "-" : phoneRelationName) +
          record?.phoneNumber;
        return <>{phoneNumber}</>;
      },
    },
    {
      title: "选购套餐",
      dataIndex: "combo",
      valueType: "select",
      fieldProps: {
        options: enum2SelectOptions(Combo, mapComboName),
      },
      valueEnum: enum2ValueEnum(Combo, mapComboName),
    },
    {
      title: "所属城市",
      dataIndex: "city",
      valueType: "cascader",
      fieldProps: {
        options: state.regionTree,
        placeholder: "请选择城市",
        changeOnSelect: true,
        showSearch: true,
        fieldNames: { label: "name", value: "code" },
      },
      renderText(text, record, index, action) {
        const formatObject = findNode(
          state.regionTree,
          (t) => t.code === record.city,
          {}
        );
        if (!formatObject) return "-";
        return (
          <>
            {formatObject?.provinceName +
              "-" +
              formatObject?.cityName +
              "-" +
              formatObject?.name}
          </>
        );
      },
    },
    {
      title: "所属街道",
      dataIndex: "street",
    },
    {
      title: "居委电话",
      dataIndex: "committeePhone",
      search: false,
    },
    {
      title: "指派管家",
      dataIndex: "agentId",
      valueType: "select",
      fieldProps: {
        options: state.agentList,
      },
      renderText: (text, record, index, action) => {
        return (
          <>{state.agentList.find((i) => i.value === record?.agentId)?.label}</>
        );
      },
    },
    {
      title: "关联设备",
      dataIndex: "deviceSn",
    },
    {
      title: "设备状态",
      dataIndex: "deviceStatus",
      fieldProps: {
        options: enum2SelectOptions(DeviceStatus, mapDeviceStatusName),
      },
      valueEnum: enum2ValueEnum(DeviceStatus, mapDeviceStatusName),
    },
    {
      title: "所属租户",
      dataIndex: "tenantId",
      valueType: "select",
      fieldProps: {
        options: state.tenantList,
      },
      renderText: (text, record, index, action) => {
        return (
          <>
            {state.tenantList.find((i) => i.value === record?.tenantId)?.label}
          </>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      search: false,
    },
  ];

  const getList = async (params) => {
    const { agentId } = params;
    const res = await get("/butlerUserService/page", {
      ...params,
      descs: "id",
      workerId: agentId,
    });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getTenantList = async () => {
    const res = await post("tenantQuery/tenantOptionList", {
      startPage: 1,
      pageSize: 100,
      includeCurrentTenant: true,
    });
    const tenantList = res.items?.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const getRegionList = async () => {
    const res = await get("regionQuery/list");
    const regionTree = listToTree(res.data, {
      id: "code",
      children: "children",
      pid: "parentCode",
    });
    setState({
      regionTree,
    });
  };

  const getAgentList = async () => {
    const { items } = await post("/butlerWorkerService/page", {
      startPage: 1,
      pageSize: 999,
    });
    const agentList = items.map((item) => ({
      value: item.userId,
      label: item.realName,
    }));
    setState({ agentList });
  };

  const handleAdd = () => {
    setState({
      writeVisible: true,
      editData: undefined,
    });
  };

  const handleDetail = (record: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", record.id);
    params.set("isCurrentTenantUser", record.isCurrentTenantUser);
    router.push(`/butlerUser/detail?${params.toString()}`);
  };
  const userInfo = useUserStore((state) => state.userInfo);
  const [handleExport, loading] = useSuperLock(async (searchParams) => {
    const res = await get(
      "/butlerUserService/export",
      {
        ...searchParams?.params,
      },
      { responseType: "blob" }
    );
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      ?.replace(/-/g, "");
    const username = userInfo?.realName;
    const fileName = `用户列表_${currentDate}_${username}.xlsx`;
    exportFile(fileName, res.data);
  });

  const handleUpload = async (file) => {
    const rawFile = file.upload[0].originFileObj as File;
    const formData = new FormData();
    formData.append("file", rawFile);
    const res = await post("/butlerUserService/import", formData);
    if (res.result === 201) {
      return { data: res.data };
    } else if (res.result === 0) {
      actionRef.current?.reload();
      message.success("导入成功");
    }
  };
  useEffect(() => {
    getTenantList();
    getRegionList();
    getAgentList();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getList}
        expandToolBarRender={(defaultBtns, searchParams) =>
          [
            ...defaultBtns,
            canCreate && (
              <Button key="add" type="primary" onClick={handleAdd}>
                新增
              </Button>
            ),
            canExport && (
              <Button
                type="primary"
                onClick={() => handleExport(searchParams)}
                loading={loading}
              >
                导出数据
              </Button>
            ),
          ].filter(Boolean)
        }
        expandActionRender={(record) =>
          [
            canDetail && (
              <Button
                color="cyan"
                key="look"
                variant="filled"
                onClick={() => handleDetail(record)}
              >
                详情
              </Button>
            ),
            canBindAgent && record.isCurrentTenantUser && (
              <Button
                key="bindAgent"
                color="primary"
                variant="filled"
                onClick={() => {
                  setState({
                    selectedRecord: record,
                    bindAgentVisible: true,
                  });
                }}
              >
                更换管家
              </Button>
            ),
            canBindDevice && record.isCurrentTenantUser && (
              <Button
                key="bindDevice"
                color="primary"
                variant="filled"
                onClick={() => {
                  setState({
                    selectedRecord: record,
                    bindDeviceVisible: true,
                  });
                }}
              >
                关联设备
              </Button>
            ),
          ].filter(Boolean)
        }
        uploadProps={{
          templateUrl:
            "https://digital-tec-pub.eos-wuxi-1.cmecloud.cn/sky/import_user_template.xlsx",
          onUpload: async (file) => {
            return await handleUpload(file);
          },
        }}
        expandButtonProps={(record) => ({
          hideUploadButton: !canImport,
        })}
      />

      <Write
        open={state.writeVisible}
        onOpenChange={(open) => setState({ writeVisible: open })}
        onSuccess={() => actionRef.current?.reload()}
        regionTree={state.regionTree}
        tenantList={state.tenantList}
        agentList={state.agentList}
      />

      <BindAgent
        open={state.bindAgentVisible}
        onOpenChange={(open) => setState({ bindAgentVisible: open })}
        onSuccess={() => actionRef.current?.reload()}
        agentList={state.agentList}
        record={state.selectedRecord}
      />

      <BindDevice
        open={state.bindDeviceVisible}
        onOpenChange={(open) => setState({ bindDeviceVisible: open })}
        onSuccess={() => actionRef.current?.reload()}
        record={state.selectedRecord}
        deviceType={DeviceType.SLIGHTLY}
        title="绑定设备"
        snLabel="设备S/N"
      />
    </>
  );
};

const BulterUser = memo(Component);
export default BulterUser;
