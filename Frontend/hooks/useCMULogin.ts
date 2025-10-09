"use client";
import { useState } from 'react';

export const useCMULogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginWithCMU = async () => {
        setLoading(true);
        setError(null);
        try {
            const redirectUri = process.env.NEXT_PUBLIC_CMU_REDIRECT_URL ?? "http://localhost:5173/cmuEntraIDCallback";
            const state = crypto.randomUUID();
            sessionStorage.setItem("cmu_oauth_state", state);

            const res = await fetch(`api/api/cmu/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`,
                { credentials: "include" }
            );
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Failed to get authorize URL");
            }
            const data = await res.json();
            const authorizeUrl = data?.authorize_url as string | undefined;
            if (!authorizeUrl) {
                throw new Error("authorize_url is missing in response");
            }
            window.location.assign(authorizeUrl);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to initiate CMU login");
        } finally {
            setLoading(false);
        }
    };

    return { loginWithCMU, loading, error };
};