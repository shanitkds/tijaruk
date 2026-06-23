"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthSession } from "../../lib/auth";

export default function BusinessRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/login");
    } else if (session.user.role !== "BUSINESS") {
      const destination =
        session.user.role === "ADMIN" || session.user.role === "INTERNAL_STAFF"
          ? "/admin"
          : "/login";
      router.replace(destination);
    } else if (session.user.role_type === "GUEST") {
      router.replace("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4f7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#500c56] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
