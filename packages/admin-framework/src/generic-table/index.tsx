"use client";

import React, { Key, useMemo, useState } from "react";
import {
  ProTable,
  ProColumns,
  ProTableProps,
  ProDescriptions,
  ProDescriptionsItemProps,
  RequestData,
  BetaSchemaForm,
  ProFormColumnsType,
  ModalForm,
  ProFormUploadDragger,
} from "@ant-design/pro-components";
import { CloudFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Space, App } from "antd";
import { SortOrder } from "antd/es/table/interface";

type BaseColumnType<T = any, ValueType = "text"> = ProColumns<T, ValueType> &
  ProDescriptionsItemProps<Record<string, any>, ValueType>;

export interface GenericProColumnType<T = any, ValueType = "text">
  extends BaseColumnType {
  /** 是否在详情中隐藏 */
  hideInDetail?: boolean;
}

interface UploadResult {
  data: any;
}

interface GenericTableSearchParams {
  params: {
    pageSize?: number;
    current?: number;
    keyword?: string;
    [key: string]: any; // 允许更多搜索字段
  };
  sort: Record<string, SortOrder>;
  filter: Record<string, (string | number)[] | null>;
}

interface GenericTableProps<T extends { id: Key } = any, ValueType = "text">
  extends Omit<
    ProTableProps<T, GenericTableSearchParams["params"], ValueType>,
    "columns" | "request"
  > {
  /** 新增 */
  onAdd?: (record: T) => Promise<void>;
  /** 编辑 */
  onEdit?: (record: T) => Promise<void>;
  /** 删除 */
  onDelete?: (record: T) => Promise<void>;
  /** 列 */
  columns: GenericProColumnType<T, ValueType>[];
  /** (可选) 如果表单列与表格列不一致，请提供此项 */
  formColumns?: ProFormColumnsType<T, ValueType>[];
  /** 远程请求 */
  request?: (
    params: GenericTableSearchParams["params"],
    sort: GenericTableSearchParams["sort"],
    filter: GenericTableSearchParams["filter"]
  ) => Promise<Partial<RequestData<T>>>;
  /** 扩展的操作栏 */
  expandActionRender?: (record: T) => React.ReactNode[];
  /** 扩展的渲染工具栏 */
  expandToolBarRender?: (
    defaultBtns: React.ReactNode[],
    searchParams: GenericTableSearchParams
  ) => React.ReactNode[];
  uploadProps?: {
    /** 下载模版地址 */
    templateUrl: string;
    onUpload: (value: Record<string, any>) => Promise<UploadResult | void>;
  };
  /** 详情的扩展字段 */
  expandDetailRender?: (record?: T) => React.ReactNode;
  /** 扩展的按钮属性，用来精细化控制视图层分离 */
  expandButtonProps?: (record?: T) => {
    /**
     * 是否隐藏添加按钮
     */
    hideAddButton?: boolean;
    /**
     * 是否隐藏编辑按钮
     */
    hideEditButton?: boolean;
    /**
     * 是否隐藏删除按钮
     */
    hideDeleteButton?: boolean;
    /**
     * 是否隐藏查看详情按钮
     *  */
    hideDetailAction?: boolean;
    /**
     * 是否隐藏上传按钮
     */
    hideUploadButton?: boolean;
  };
}

const GenericTable = <T extends { id: Key } = any, ValueType = "text">({
  onAdd,
  onEdit,
  onDelete,
  columns,
  formColumns,
  request,
  expandActionRender,
  expandToolBarRender,
  expandDetailRender,
  uploadProps,
  expandButtonProps,
  ...restProps
}: GenericTableProps<T, ValueType>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadErrorData, setUploadErrorData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [searchParams, setSearchParams] = useState<GenericTableSearchParams>(
    {} as GenericTableSearchParams
  );
  const { modal, message } = App.useApp();

  const finalFormColumns = useMemo(
    () => formColumns || (columns as ProFormColumnsType<T, ValueType>[]),
    [columns, formColumns]
  );

  const wrappedRequest = (
    params: GenericTableSearchParams["params"],
    sort: GenericTableSearchParams["sort"],
    filter: GenericTableSearchParams["filter"]
  ): Promise<Partial<RequestData<T>>> => {
    const convertedParams = {
      ...params,
      startPage: params.current,
    };
    delete convertedParams.current;
    setSearchParams({ params: convertedParams, sort, filter });
    if (request) {
      return request(convertedParams, sort, filter);
    }

    return Promise.resolve({ data: [], success: true });
  };

  const handleAdd = () => {
    setModalTitle("新增");
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: T) => {
    setModalTitle("编辑");
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleLook = (record: T) => {
    setModalTitle("查看详情");
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleDelete = (record: T) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
      okText: "删除",
      cancelText: "取消",
      onOk: () => {
        if (onDelete) {
          onDelete(record);
        }
      },
    });
  };

  const handleDownloadTemplate = async () => {
    const tempUrl = uploadProps?.templateUrl || "";
    const fileName = "导入模板.xlsx";
    try {
      const response = await fetch(tempUrl);
      if (!response.ok) {
        throw new Error(`网络响应错误: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("模板下载失败:", error);
      message.error("模板下载失败，请检查网络或联系管理员。");
    }
  };

  const handleImport = async (values: Record<string, any>) => {
    if (!uploadProps?.onUpload) return;
    try {
      const result = await uploadProps.onUpload(values);
      if (result && result?.data) {
        setUploadErrorData(result.data);
      } else {
        message.success("上传成功，后台正在处理");
        setUploadModalVisible(false);
      }
    } catch (error) {
      console.error("上传失败:", error);
    }
  };

  // 统一的表单提交逻辑
  const handleFormSubmit = async (values: T) => {
    if (currentRecord && onEdit) {
      await onEdit({ ...currentRecord, ...values });
    } else if (onAdd) {
      await onAdd(values);
    }
    setModalVisible(false);
  };

  const hasEditCloumns = [
    onEdit,
    onDelete,
    expandButtonProps,
    expandActionRender,
  ].some(Boolean);

  const editColumns: ProColumns<T, ValueType>[] = hasEditCloumns
    ? [
        {
          title: "操作",
          dataIndex: "action",
          valueType: "option",
          fixed: "right",
          render: (_: any, record: T) => {
            const defaultBtns = [
              onEdit && !expandButtonProps?.(record)?.hideEditButton && (
                <Button
                  onClick={() => handleEdit(record)}
                  color="primary"
                  key="edit"
                  variant="filled"
                  hidden
                >
                  编辑
                </Button>
              ),
              onDelete && !expandButtonProps?.(record)?.hideDeleteButton && (
                <Button
                  onClick={() => handleDelete(record)}
                  color="danger"
                  key="delete"
                  variant="filled"
                >
                  删除
                </Button>
              ),
              !expandButtonProps?.(record)?.hideDetailAction && (
                <Button
                  onClick={() => handleLook(record)}
                  color="cyan"
                  key="look"
                  variant="filled"
                >
                  查看详情
                </Button>
              ),
            ].filter(Boolean);

            const expandBtns = expandActionRender
              ? expandActionRender(record)
              : [];

            return <Space>{[...expandBtns, ...defaultBtns]}</Space>;
          },
        },
      ]
    : [];

  const fullColumns = [...columns, ...editColumns] as ProColumns<
    T,
    ValueType
  >[];

  const uploadErrorColumns = [
    {
      dataIndex: "lineNum",
      title: "行号",
    },
    {
      dataIndex: "errors",
      title: "错误描述",
      renderText(text: string, record: any, index: number, action: any) {
        return <>{record?.errors.join(",")}</>;
      },
    },
  ];

  const defaultToolBarBtns = [
    onAdd && !expandButtonProps?.()?.hideAddButton && (
      <Button
        type="primary"
        onClick={() => handleAdd()}
        icon={<PlusOutlined />}
        key="add"
      >
        新增
      </Button>
    ),
    uploadProps && !expandButtonProps?.()?.hideUploadButton && (
      <Button
        type="primary"
        onClick={() => {
          setUploadModalVisible(true), setUploadErrorData([]);
        }}
        icon={<CloudFilled />}
        key="upload"
      >
        批量导入
      </Button>
    ),
  ].filter(Boolean);

  const toolBarBtns = expandToolBarRender
    ? expandToolBarRender(defaultToolBarBtns, searchParams)
    : defaultToolBarBtns;

  const isDetail = modalTitle === "查看详情";

  return (
    <>
      <ProTable<T, GenericTableSearchParams["params"], ValueType>
        toolBarRender={() => toolBarBtns}
        scroll={{ x: "max-content" }}
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 10,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        request={wrappedRequest}
        columns={fullColumns}
        rowKey="id"
        bordered
        {...restProps}
      />
      {isDetail && (
        <ModalForm
          title={modalTitle}
          open={modalVisible}
          onOpenChange={setModalVisible}
          submitter={false}
          modalProps={{
            destroyOnHidden: true,
          }}
        >
          <ProDescriptions columns={columns} dataSource={currentRecord || {}} />
          {expandDetailRender && expandDetailRender(currentRecord || undefined)}
        </ModalForm>
      )}

      <ModalForm
        title="批量导入"
        open={uploadModalVisible}
        onOpenChange={setUploadModalVisible}
        onFinish={async (values) => handleImport(values)}
        modalProps={{
          destroyOnHidden: true,
        }}
        submitter={uploadErrorData.length === 0 ? undefined : false}
      >
        {uploadErrorData.length === 0 ? (
          <>
            <ProFormUploadDragger
              max={1}
              label="上传文件"
              name="upload"
              accept=".xlsx, .xls"
              rules={[{ required: true, message: "请上传文件" }]}
              extra={"仅允许导入xls、xlsx格式文件"}
            />
            <Button type="primary" onClick={() => handleDownloadTemplate()}>
              下载模版
            </Button>
          </>
        ) : (
          <ProTable
            search={false}
            options={false}
            dataSource={uploadErrorData}
            columns={uploadErrorColumns}
          />
        )}
      </ModalForm>

      {!isDetail && (onAdd || onEdit) && (
        <BetaSchemaForm<T, ValueType>
          key={modalTitle + (currentRecord?.id || "new")}
          title={modalTitle}
          open={modalVisible}
          onOpenChange={setModalVisible}
          columns={finalFormColumns}
          rowProps={{ gutter: [16, 16] }}
          colProps={{ span: 12 }}
          grid={true}
          layoutType="ModalForm"
          onFinish={handleFormSubmit}
          initialValues={currentRecord || undefined}
        />
      )}
    </>
  );
};

export default GenericTable;
