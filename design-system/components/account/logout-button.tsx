"use client";

import * as React from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/actions/auth";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleLogout() {
    setLoading(true);
    await logoutUser();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" loading={loading} onClick={handleLogout} aria-label={label}>
      {label}
    </Button>
  );
}
