"use client";
import { useUserStore } from "@/stores/useUserStore";
import ForbiddenPage from "@repo/admin-framework/403";
import { useRouter } from "next/navigation";
export default function Custom403() {
  const router = useRouter();
  const menusPermissions = useUserStore((state) => state.menusPermissions);
  const firstRoute =
    menusPermissions && menusPermissions?.length > 0
      ? menusPermissions[0]
      : "/userInfo";
  const handleGoHome = () => {
    router.push(firstRoute as string);
  };

  return <ForbiddenPage onGoHome={() => handleGoHome()} />;
}
