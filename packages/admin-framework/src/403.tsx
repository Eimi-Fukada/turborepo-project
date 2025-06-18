"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface ForbiddenPageProps {
  onGoHome?: () => void;
}
const ForbiddenPage: FC<ForbiddenPageProps> = ({ onGoHome }) => {
  const router = useRouter();

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面"
      extra={
        <Button
          type="primary"
          onClick={onGoHome ? onGoHome : () => router.push("/")}
        >
          返回首页
        </Button>
      }
    />
  );
};

export default ForbiddenPage;
