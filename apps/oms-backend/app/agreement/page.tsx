"use client";

import { useCallBackState } from "@/hooks/useCallBackState";
import { del, get, post } from "@/request";
import { setupPdfWorker } from "@/utils/pdfWorkerLoader";
import {
  ActionType,
  ModalForm,
  ProFormSelect,
  ProFormUploadDragger,
} from "@ant-design/pro-components";
import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";
import { App, Button, Form, Image, Space } from "antd";
import { FC, memo, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PageViewport } from "pdfjs-dist";
import { hasBtnPermission } from "@/utils/permission";

const Component: FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [state, setState] = useCallBackState<{
    tenantList: { value: number; label: string }[];
    open: boolean;
    url: string;
  }>({
    tenantList: [],
    open: false,
    url: "",
  });

  const canAdd = hasBtnPermission("butlerAgreementService:add");
  const canDel = hasBtnPermission("butlerAgreementService:remove");
  const canEnable = hasBtnPermission("butlerAgreementService:enable");

  const columns: GenericProColumnType[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
    },
    {
      title: "ID",
      dataIndex: "id",
      search: false,
    },
    {
      title: "协议",
      dataIndex: "url",
      search: false,
      renderText(text, record, index, action) {
        return (
          <Image
            src={record.url}
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "协议类型",
      dataIndex: "type",
      valueType: "select",
      fieldProps: {
        options: [
          { value: 0, label: "预约挂号" },
          { value: 1, label: "智能设备" },
        ],
      },
    },
    {
      title: "是否启用",
      dataIndex: "status",
      search: false,
      valueType: "select",
      fieldProps: {
        options: [
          { value: 1, label: "启用" },
          { value: 0, label: "禁用" },
        ],
      },
      valueEnum: {
        1: { text: "启用", status: "Success" },
        0: { text: "禁用", status: "Error" },
      },
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
  ];

  const getList = async (params) => {
    const res = await get("/butlerAgreementService/page", { ...params });
    return {
      data: res.items,
      total: res.total,
      success: res.result === 0,
    };
  };

  const getTenantList = async () => {
    const res = await post("/tenantQuery/tenantOptionList", {
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

  const handleDel = async (rowKeys) => {
    await del("/butlerAgreementService/remove", { ids: rowKeys });
    message.success("删除成功");
  };

  const handleChangeStatus = async (record) => {
    modal.confirm({
      title: "提示",
      content: "确认要启用该隐私协议吗?",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        await post("/butlerAgreementService/enable", record.id);
        actionRef.current?.reload();
      },
    });
  };

  const handleUpload = async (file) => {
    await setupPdfWorker();
    // 处理预览
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    console.log(`PDF共有${numPages}页`);

    // 调整scale以获得更好的渲染质量
    const scale = 1.5;
    let totalHeight = 0;
    let maxWidth = 0;
    const pageViewports: pdfjsLib.PageViewport[] = [];

    // 第一遍遍历计算尺寸
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      pageViewports.push(viewport);
      totalHeight += viewport.height + 20; // 添加页间距
      maxWidth = Math.max(maxWidth, viewport.width);
    }

    // 创建主canvas并设置尺寸
    const mainCanvas = document.createElement("canvas");
    mainCanvas.width = maxWidth;
    mainCanvas.height = totalHeight;
    const mainContext = mainCanvas.getContext("2d", {
      alpha: false,
    });
    if (!mainContext) throw new Error("无法创建canvas上下文");

    // 设置白色背景
    mainContext.fillStyle = "#FFFFFF";
    mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    // 逐页渲染
    let currentY = 0;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = pageViewports[pageNum - 1] as PageViewport;

      // 为每页创建临时canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      const tempContext = tempCanvas.getContext("2d", {
        alpha: false,
      });
      if (!tempContext) throw new Error("无法创建临时canvas上下文");

      // 在临时canvas上渲染
      tempContext.fillStyle = "#FFFFFF";
      tempContext.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvasContext: tempContext,
        viewport,
        background: "white",
      }).promise;

      // 将临时canvas的内容绘制到主canvas
      mainContext.drawImage(tempCanvas, 0, currentY);
      currentY += viewport.height + 20; // 添加页间距

      // 清理临时canvas
      tempCanvas.remove();
    }

    // 转换为Blob
    const blob = await new Promise<Blob>((resolve) => {
      mainCanvas.toBlob((b) => b && resolve(b), "image/png", 1.0);
    });

    // 创建预览URL
    const previewUrl = URL.createObjectURL(blob);
    setState({
      url: previewUrl,
    });
  };

  const urlToFile = async (url: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], "preview.png", { type: "image/png" });
  };

  const handleFinish = async (values) => {
    const previewFile = await urlToFile(state.url);
    const formData = new FormData();
    formData.append("file", previewFile);
    const { data } = await post("/commonService/upload", formData);
    await post("/butlerAgreementService/add", {
      tenantId: values.tenantId,
      url: data.path,
      type: values.type,
    });
    message.success("上传成功");
    actionRef.current?.reload();
  };

  useEffect(() => {
    getTenantList();
  }, []);

  return (
    <>
      <GenericTable
        actionRef={actionRef}
        columns={columns}
        request={getList}
        expandToolBarRender={(_, searchParams) => [
          canAdd && (
            <Button
              type="primary"
              onClick={() => {
                setState({
                  open: true,
                  url: "",
                });
                form.resetFields();
              }}
            >
              新增
            </Button>
          ),
        ]}
        expandActionRender={(record) => [
          record.status === 0 && canEnable && (
            <Button
              color={"cyan"}
              variant="filled"
              onClick={() => handleChangeStatus(record)}
            >
              启用
            </Button>
          ),
        ]}
        headerTitle="批量操作"
        rowSelection={{}}
        tableAlertOptionRender={({ onCleanSelected, selectedRowKeys }) => {
          return (
            <Space size={16}>
              <a onClick={() => handleDel(selectedRowKeys)}>批量删除</a>
              <a onClick={onCleanSelected}>取消选择</a>
            </Space>
          );
        }}
        onDelete={(record) => handleDel([record.id])}
        expandButtonProps={(record) => ({
          hideDeleteButton: !canDel,
        })}
      />
      <ModalForm
        title={"新增"}
        open={state.open}
        form={form}
        modalProps={{
          destroyOnHidden: true,
        }}
        onOpenChange={(open) => setState({ open })}
        onFinish={(values) => handleFinish(values)}
      >
        <ProFormUploadDragger
          max={1}
          label="协议文件"
          name="url"
          accept=".pdf"
          rules={[{ required: true, message: "请上传文件" }]}
          extra={"请上传PDF格式的协议文件"}
          onChange={(file) => handleUpload(file.file.originFileObj)}
        />
        {state.url && (
          <div style={{ maxHeight: "350px", overflow: "scroll" }}>
            <Image src={state.url} />
          </div>
        )}
        <ProFormSelect
          name="tenantId"
          label="所属租户"
          options={state.tenantList}
          placeholder="请选择租户"
          rules={[{ required: true, message: "请选择租户" }]}
        />
        <ProFormSelect
          name="type"
          label="协议类型"
          options={[
            { value: 0, label: "预约挂号" },
            { value: 1, label: "智能设备" },
          ]}
          placeholder="请选择协议类型"
          rules={[{ required: true, message: "请选择协议类型" }]}
        />
      </ModalForm>
    </>
  );
};

const Agreement = memo(Component);
export default Agreement;
