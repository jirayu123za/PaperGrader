"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@mantine/core";

export default function CmuEntraIDCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (!code) {
        console.error("Missing code");
        return;
      }

      const stored = sessionStorage.getItem("cmu_oauth_state");
      if (stored && state && stored !== state) {
        console.error("State mismatch");
        router.replace("/");
        return;
      }

      const res = await fetch("/api/api/cmu/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          redirect_uri:
            process.env.NEXT_PUBLIC_CMU_REDIRECT_URL ??
            "http://localhost:5173/cmuEntraIDCallback",
        }),
      });

      const data = await res.json().catch(() => ({} as any));
        if (!res.ok) {
            console.error("Exchange failed:", data);
            router.replace("/");
            return;
        }
      
        if (res.ok && data?.needs_sign_up && typeof data.redirect_url === "string") {
            window.location.assign(data.redirect_url);
            return;
        }

        const me = await fetch("/api/api/cmu/userGroup", { credentials: "include" });
        if (!me.ok) {
            router.replace("/");
            return;
        }
        const { group_id } = (await me.json()) as { group_id: number };

        router.replace(group_id === 1 ? "/INSCourseOverview" : group_id === 2 ? "/student/overview" : "/");
    };

    Promise.resolve().then(run);
  }, [router]);

  return <Loader size="xl" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
}
