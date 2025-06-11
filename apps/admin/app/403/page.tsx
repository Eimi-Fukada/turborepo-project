"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面"
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          返回首页
        </Button>
      }
    />
  );
}
