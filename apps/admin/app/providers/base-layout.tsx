"use client";

import { routes } from "@/config/routes";
import BaseLayout from "@repo/admin-framework/layout-providers/base-layout";
import RootProvider from "@repo/admin-framework/layout-providers/root-provider";

export default function MyBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider>
      <BaseLayout menuData={routes}>{children}</BaseLayout>
    </RootProvider>
  );
}
