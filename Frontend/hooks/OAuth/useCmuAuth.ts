import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/src/lib/api";

type ExchangeVars = {
    code: string;
    redirect_uri: string;
    state?: string | null;
};

type ExchangeResponse = {
    needs_sign_up?: boolean;
    redirect_uri?: string;
};

type UserGroupResponse = { group_id: number };

const EXCHANGE_URL = `${API_BASE}/cmu/exchange`;
const USER_GROUP_URL = `${API_BASE}/cmu/userGroup`;

export function useCmuExchange() {
    return useMutation<ExchangeResponse, Error, ExchangeVars>({
        mutationFn: async ({ code, redirect_uri, state }) => {
            const res = await axios.post(
                EXCHANGE_URL,
                {
                    code,
                    redirect_uri: redirect_uri,
                    ...(state ? { state } : {}),
                },
                { withCredentials: true, validateStatus: () => true }
            );
            const data: ExchangeResponse = res.data ?? {};
            if (res.status !== 200) {
                throw new Error(
                    (data as any)?.message || `Exchange failed (status ${res.status})`
                );
            }
            return data;
        },
    });
}

export function useUserGroupQuery(enabled = false) {
    return useQuery<UserGroupResponse>({
        queryKey: ["cmu-user-group"],
        queryFn: async () => {
            const res = await axios.get(USER_GROUP_URL, {
                withCredentials: true,
                validateStatus: () => true,
            });
            if (res.status !== 200) {
                throw new Error(`userGroup failed (status ${res.status})`);
            }
            return res.data as UserGroupResponse;
        },
        enabled,
        retry: 1,
    });
}
