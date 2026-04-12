"use client";

import GenericTable, {
  GenericProColumnType,
} from "@repo/admin-framework/generic-table/index";

export default function Home() {
  const columns: GenericProColumnType[] = [
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
      <GenericTable columns={columns} />
    </>
  );
}
