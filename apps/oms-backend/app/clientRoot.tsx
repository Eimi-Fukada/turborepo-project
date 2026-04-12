"use client";
import dynamic from "next/dynamic";
const MyBaseLayout = dynamic(() => import("./providers/base-layout"), {
  ssr: false,
});

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MyBaseLayout>{children}</MyBaseLayout>;
}
