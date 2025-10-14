"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@mantine/core";
import { useCmuExchange, useUserGroupQuery } from "@/hooks/OAuth/useCmuAuth";

type ExchangeResponse = {
    needs_sign_up?: boolean;
    redirect_uri?: string;
};

export default function CmuEntraIDCallback() {
  const router = useRouter();
  const exchange = useCmuExchange();
  const userGroup = useUserGroupQuery(false);

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (!code) {
        console.error("Missing code");
        router.replace("/");
        return;
      }

      const stored = sessionStorage.getItem("cmu_oauth_state");
      if (stored && state && stored !== state) {
        console.error("State mismatch");
        router.replace("/");
        return;
      }

      const redirect_uri = process.env.NEXT_PUBLIC_CMU_REDIRECT_URL ?? "http://localhost:5173/cmuEntraIDCallback";

      let data: ExchangeResponse | undefined;
      try {
        data = await exchange.mutateAsync({ code, redirect_uri, state });
      } catch (e) {
        console.error("Exchange failed:", e);
        router.replace("/");
        return;
      }
      
      if (!data) {
        router.replace("/");
        return;
      }

      if ((data.needs_sign_up) && typeof data.redirect_uri === "string") {
        window.location.assign(data.redirect_uri as string);
        return;
      }

      try {
        const me = await userGroup.refetch();
        if (!me?.data) {
          router.replace("/");
          return;
        }
        const gid = me.data.group_id;
        router.replace(gid === 1 ? "/INSCourseOverview" : gid === 2 ? "/student/overview" : "/");
      } catch (e) {
        console.error("userGroup failed:", e);
        router.replace("/");
      }
    };

    Promise.resolve().then(run);
  }, [router]);

  return <Loader size="xl" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
}
