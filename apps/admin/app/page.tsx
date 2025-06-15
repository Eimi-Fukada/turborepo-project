"use client";
import { ProColumns } from "@ant-design/pro-components";
import GenericTable from "@repo/admin-framework/generic-table/index";

export default function Home() {
  const columns: ProColumns[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      formItemProps: {
        rules: [{ required: true, message: "Please input your age!" }],
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        url="/api/users"
        onAdd={async (record) => {
          console.log("add", record);
        }}
        onEdit={async (record) => {
          console.log("edit", record);
        }}
        onDelete={async (id) => {
          console.log("delete", id);
        }}
      />
    </>
  );
}
