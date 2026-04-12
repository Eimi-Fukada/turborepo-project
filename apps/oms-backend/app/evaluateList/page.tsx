"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { post } from "@/request";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { Button } from "antd";
import { FC, memo, useEffect, useState } from "react";
import EvaluateModal from "./components/evaluateModal";
import { hasBtnPermission } from "@/utils/permission";
const Component: FC = () => {
  const canShowDetail = hasBtnPermission(
    "/evaluateListIndex/evaluateDetail:detail"
  );

  const [state, setState] = useCallBackState<{
    tenantList: { value: string; label: string }[];
  }>({
    tenantList: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number>(0);

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "手机号",
      dataIndex: "contactMobile",
    },
    {
      title: "测评类型",
      dataIndex: "privilegeType",
      valueType: "select",
      fieldProps: {
        options: [{ value: "1", label: "自主测评" }],
      },
      valueEnum: {
        "1": { text: "自主测评" },
      },
    },
    {
      title: "来源",
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
      title: "状态",
      dataIndex: "status",
      fieldProps: {
        options: [
          { value: "1", label: "待测评" },
          { value: "2", label: "已完成" },
        ],
      },
      valueEnum: {
        "1": { text: "待测评", status: "Default" },
        "2": { text: "已完成", status: "Success" },
      },
    },
    {
      title: "测评时间",
      dataIndex: "evaluateTime",
      valueType: "dateRange",
      search: {
        transform: (value) => {
          if (value && Array.isArray(value)) {
            return {
              evaluateBeginTime: value[0],
              evaluateEndTime: value[1],
            };
          }
          return {};
        },
      },
      render: (text, record) => {
        return record.evaluateTime || "-";
      },
      fieldProps: {
        placeholder: ["开始日期", "结束日期"],
        style: { width: "100%" },
      },
    },
    {
      title: "居家老人",
      dataIndex: "realName",
      valueType: "select",
      search: false,
    },
    {
      title: "关系",
      dataIndex: "relationDesc",
      search: false,
    },
  ];

  const getEvaludateList = async (params) => {
    const res = await post("/evaluateQuery/pageEvaluate", { ...params });
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

  useEffect(() => {
    getSelectOptions();
  }, []);

  return (
    <>
      <GenericTable
        columns={columns}
        request={getEvaludateList}
        expandActionRender={(record) => [
          canShowDetail && (
            <Button
              color={"cyan"}
              variant="filled"
              onClick={() => {
                setSelectedReportId(record.reportId);
                setModalVisible(true);
              }}
            >
              详情
            </Button>
          ),
        ]}
        expandButtonProps={(record) => ({
          hideDetailAction: true,
        })}
        expandToolBarRender={(_, searchParams) => []}
      />

      <EvaluateModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        reportId={selectedReportId}
      />
    </>
  );
};

const EvaluateList = memo(Component);
export default EvaluateList;
