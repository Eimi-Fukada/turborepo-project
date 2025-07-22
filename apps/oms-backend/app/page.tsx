"use client";
import { useCallBackState } from "@/hooks/useCallBackState";
import { post } from "@/request";
import {
  ProCard,
  ProColumns,
  ProFormDateRangePicker,
  ProFormDependency,
  ProTable,
} from "@ant-design/pro-components";
import { FC, memo, useEffect } from "react";
import Image from "next/image";

const Component: FC = () => {
  const [state, setState] = useCallBackState<{
    tenantList: { value: number; label: string }[];
    params: {
      tenantId: string;
      privilegeType: string;
      recentDays: string;
      dateRange: string[];
    };
    summary: {
      activateCount: number;
      usageCount: number;
    };
    config: any;
  }>({
    tenantList: [],
    params: {} as any,
    summary: {} as any,
    config: {},
  });

  const columns: ProColumns[] = [
    {
      dataIndex: "tenantId",
      title: "渠道",
      valueType: "select",
      fieldProps: {
        options: state.tenantList,
      },
    },
    {
      dataIndex: "privilegeType",
      title: "权益类型",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "1", label: "自主测评" },
          { value: "2", label: "视频测评" },
          { value: "3", label: "上门测评" },
        ],
      },
    },
    {
      dataIndex: "recentDays",
      title: "时间区间",
      valueType: "select",
      fieldProps: {
        options: [
          { value: "1", label: "今天" },
          { value: "7", label: "近7天" },
          { value: "30", label: "近30天" },
          { value: "-1", label: "自定义时间选择" },
        ],
      },
    },
    {
      dataIndex: "dateRange",
      renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
        return (
          <ProFormDependency name={["recentDays"]}>
            {({ recentDays }) => {
              if (recentDays === "-1") {
                return (
                  <ProFormDateRangePicker
                    name="dateRange"
                    label="自定义时间"
                    fieldProps={{
                      format: "YYYY-MM-DD",
                    }}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
        );
      },
      formItemProps: {
        style: { width: 500 },
      },
    },
  ];

  const getTenantList = async () => {
    const res = await post("tenantQuery/tenantOptionList", {
      startPage: 1,
      pageSize: 100,
      includeCurrentTenant: true,
    });
    const tenantList = res.items.map((i) => {
      return {
        value: i.id,
        label: i.name,
      };
    });
    setState({
      tenantList,
    });
  };

  const handleParams = async (params) => {
    setState({
      params,
    });
    return {
      data: [],
      total: 0,
      success: true,
    };
  };

  const getAnalysisData = async () => {
    const params =
      state.params?.recentDays !== "-1"
        ? {
            tenantId: state.params?.tenantId,
            privilegeType: state.params?.privilegeType,
            recentDays: state.params?.recentDays,
          }
        : {
            tenantId: state.params?.tenantId,
            privilegeType: state.params?.privilegeType,
            recentDays: state.params?.recentDays,
            beginTime: state.params?.dateRange[0],
            endTime: state.params?.dateRange[1],
          };
    const [summary, usage] = await Promise.all([
      post("/privilegeQuery/summary", { ...params }),
      post("/privilegeQuery/usage", { ...params }),
    ]);
    setState({
      summary: summary.data,
    });
  };

  useEffect(() => {
    getTenantList();
    getAnalysisData();
  }, []);

  return (
    <>
      <ProTable
        columns={columns}
        search={{
          span: 4,
        }}
        request={async (params) => handleParams(params)}
        tableRender={() => (
          <>
            <div className="flex" style={{ marginBottom: "20px" }}>
              <ProCard
                title="激活权益数"
                boxShadow
                style={{ width: "500px", marginRight: "24px" }}
              >
                <div className="flex justify-between items-center">
                  <Image
                    src="/activate-count.png"
                    alt="激活权益数图标"
                    width={60}
                    height={60}
                  />
                  <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                    {state.summary?.activateCount}
                  </span>
                </div>
              </ProCard>
              <ProCard title="使用权益数" boxShadow style={{ width: "500px" }}>
                <div className="flex justify-between items-center">
                  <Image
                    src="/usage-count.png"
                    alt="使用权益数图标"
                    width={60}
                    height={60}
                  />
                  <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                    {state.summary?.usageCount}
                  </span>
                </div>
              </ProCard>
            </div>
            <ProCard boxShadow>{/* <Line {...state.config} /> */}</ProCard>
          </>
        )}
      />
    </>
  );
};

const Home = memo(Component);
export default Home;
