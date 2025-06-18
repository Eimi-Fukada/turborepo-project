"use client";

import React, { ReactNode, useState } from "react";
import {
  ProTable,
  ModalForm,
  ProColumns,
  ProFormInstance,
  ProForm,
} from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Space } from "antd";
import { get } from "@repo/shared-request";

interface GenericTableProps<DataSource = any, ValueType = any> {
  url: string;
  columns: ProColumns<DataSource, ValueType>[];
  renderForm?: (form: ProFormInstance<DataSource>) => React.ReactNode;
  onAdd?: (record: DataSource) => Promise<void>;
  onEdit?: (record: DataSource) => Promise<void>;
  onDelete?: (id: number | string) => Promise<void>;
}

const GenericTable: React.FC<GenericTableProps> = ({
  url,
  columns,
  renderForm,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const mockData = [
    {
      id: 1,
      name: "John Doe",
      age: 30,
      address: "New York No. 1 Lake Park",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 25,
      address: "London No. 1 Lake Park",
    },
    {
      id: 3,
      name: "Mike Johnson",
      age: 35,
      address: "Sydney No. 1 Lake Park",
    },
  ];

  const request = async (params: any) => {
    // const res = await get(url, {
    //   ...params,
    // });
    // return {
    //   data: res.items || mockData,
    //   total: res.total || 0,
    //   success: true,
    // };
    return {
      data: mockData,
      total: 0,
      success: true,
    };
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (id: number | string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
      okText: "删除",
      cancelText: "取消",
      onOk: () => {
        if (onDelete) {
          onDelete(id);
        }
      },
    });
  };

  const handleFinish = async (values: any) => {
    if (currentRecord && onEdit) {
      await onEdit({ ...currentRecord, ...values });
    } else if (onAdd) {
      await onAdd({ ...currentRecord, ...values });
    }
    setModalVisible(false);
  };

  const editColumns =
    onEdit || onDelete
      ? [
          {
            title: "操作",
            dataIndex: "action",
            valueType: "option",
            fixed: "right",
            render: (_: any, record: any) => (
              <Space>
                {onEdit && (
                  <Button
                    onClick={() => handleEdit(record)}
                    color="primary"
                    key="edit"
                    variant="filled"
                  >
                    编辑
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => handleDelete(record.id)}
                    color="danger"
                    key="delete"
                    variant="filled"
                  >
                    删除
                  </Button>
                )}
              </Space>
            ),
          },
        ]
      : [];

  const fullColumns = [...columns, ...editColumns] as ProColumns<any, any>[];

  const modalTitle = currentRecord ? "编辑" : "新增";

  return (
    <>
      <ProTable
        headerTitle={
          onAdd && (
            <Button
              type="primary"
              onClick={() => handleAdd()}
              icon={<PlusOutlined />}
            >
              新增
            </Button>
          )
        }
        scroll={{ x: true }}
        pagination={{
          showQuickJumper: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        request={request}
        columns={fullColumns}
        rowKey="id"
        bordered
      />
      <ModalForm
        title={modalTitle}
        open={modalVisible}
        onOpenChange={setModalVisible}
        modalProps={{
          destroyOnHidden: true,
        }}
        onFinish={async (values) => handleFinish(values)}
        form={form}
      >
        {renderForm ? (
          renderForm(form)
        ) : (
          <ProForm.Group>
            {columns.map((column) => {
              if (
                column.dataIndex &&
                column.title &&
                column.valueType !== "option"
              ) {
                return (
                  <Form.Item
                    key={column.dataIndex}
                    name={column.dataIndex}
                    label={column.title as ReactNode}
                    {...(column.formItemProps || {})}
                  >
                    <Input placeholder={`请输入${column.title}`} />
                  </Form.Item>
                );
              }
              return null;
            })}
          </ProForm.Group>
        )}
      </ModalForm>
    </>
  );
};

export default GenericTable;
