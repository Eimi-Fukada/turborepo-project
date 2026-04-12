"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { useSuperLock } from "@/hooks/useSuperLock";
import { get, post } from "@/request";
import { useUserStore } from "@/stores/useUserStore";
import { exportFile, formatDuration } from "@/utils/help";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button } from "antd";
import { FC, memo, useEffect, useState } from "react";
import CreatePrivilegeCardModal from "./components/createPrivilege";
import { hasBtnPermission } from "@/utils/permission";
const Component: FC = () => {
  const canExport = hasBtnPermission("/privilegeList/privilege:export");
  const canGenCard = hasBtnPermission("/privilegeList/privilege:gencard");

  const [state, setState] = useCallBackState<{
    workList: { value: string; label: string }[];
    tenantList: { value: string; label: string }[];
  }>({
    workList: [],
    tenantList: [],
  });
  const userInfo = useUserStore((state) => state.userInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePrivilege = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "权益卡名称",
      dataIndex: "name",
    },
    {
      title: "权益卡号",
      dataIndex: "cardNo",
    },
    {
      title: "权益卡密码",
      dataIndex: "activateCode",
    },
    {
      title: "手机号",
      dataIndex: "mobile",
    },
    {
      title: "渠道来源",
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
      dataIndex: "insertTime",
      search: false,
    },
    {
      title: "激活时间",
      dataIndex: "activateTimeRange",
      valueType: "dateRange",
      search: {
        transform: (value) => {
          if (value && Array.isArray(value)) {
            return {
              beginTime: value[0],
              endTime: value[1],
            };
          }
          return {};
        },
      },
      render: (text, record) => {
        return record.activateTime || "-";
      },
      fieldProps: {
        placeholder: ["开始日期", "结束日期"],
        style: { width: "100%" },
      },
    },
    {
      title: "激活手机号",
      dataIndex: "mobile",
      search: false,
    },
    {
      title: "激活状态",
      dataIndex: "status",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "", label: "全部" },
          { value: "1", label: "未激活" },
          { value: "2", label: "已激活" },
        ],
      },
      valueEnum: {
        "": { text: "全部", status: "Default" },
        "1": { text: "未激活", status: "Processing" },
        "2": { text: "已激活", status: "Success" },
      },
    },
  ];

  const getPrivilegeList = async (params) => {
    const res = await post("/privilegeCard/pageQueryPrivileges", { ...params });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getSelectOptions = async () => {
    const [tenantData] = await Promise.all([
      post("tenantQuery/tenantOptionList", {
        startPage: 1,
        pageSize: 100,
        includeCurrentTenant: true,
      }),
    ]);
    const tenantList = tenantData.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const [handleExport, loading] = useSuperLock(async (searchParams) => {
    const res = await post(
      "/privilegeCard/exportPrivileges",
      {
        ...searchParams?.params,
      },
      null,
      { responseType: "blob" }
    );
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      ?.replace(/-/g, "");
    const username = userInfo?.realName;
    const fileName = `权益卡列表_${currentDate}_${username}.xlsx`;
    exportFile(fileName, res.data);
  });

  useEffect(() => {
    getSelectOptions();
  }, []);

  return (
    <>
      <GenericTable
        columns={columns}
        request={getPrivilegeList}
        expandToolBarRender={(_, searchParams) => [
          canExport && (
            <Button
              type="primary"
              onClick={() => handleExport(searchParams)}
              loading={loading}
            >
              导出数据
            </Button>
          ),
          canGenCard && (
            <Button type="primary" onClick={handleCreatePrivilege}>
              生成权益卡
            </Button>
          ),
        ]}
      />

      <CreatePrivilegeCardModal
        onSubmit={() => {}}
        visible={isModalOpen}
        onCancel={handleModalClose}
        tenantList={state.tenantList}
      />
    </>
  );
};

const PrivilegeList = memo(Component);
export default PrivilegeList;
