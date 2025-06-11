"use client";
// import { type ImageProps } from "next/image";
import styles from "./page.module.css";
import { WaterMark } from "@ant-design/pro-components";

// type Props = Omit<ImageProps, "src"> & {
//   srcLight: string;
//   srcDark: string;
// };

export default function Home() {
  return (
    <div className={styles.page}>
      <div className="text-3xl font-bold underline">123123</div>
      <WaterMark content="蚂蚁集团">
        <div style={{ height: 500, width: 500 }} />
      </WaterMark>
    </div>
  );
}
