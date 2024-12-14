import type { Database } from "$lib/types/database.types";
import { getUser, supabase } from "./backend.svelte.ts";
const user = $derived(getUser());
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { handleServerFunctionResponse } from "$lib/utils/errorHandling";
export type Invite = Database["public"]["Tables"]["groups_invites"]["Insert"];

export const getPendingInviteCount = async () => {
    if (!user) {
        return { data: 0, error: "user not found" };
    }
    const { count, error } = await supabase
        .from("groups_invites")
        .select("*", { count: "exact", head: true })
        .eq("email", user.email);
    return { data: count, error };
};
export const getInvites = async (groupid: string) => {
    const { data, error } = await supabase.from("groups_invites").select("*")
        .eq(
            "groupid",
            groupid,
        );
    return { data, error };
};

export const createInvite = async (
    groupid: string,
    email: string,
    user_role: string,
) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "invite_insert",
                payload: {
                    groupid,
                    email,
                    user_role,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteInvite = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "invite_delete",
                payload: {
                    id,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const acceptInvite = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "invite_accept",
                payload: {
                    id,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const rejectInvite = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "invite_reject",
                payload: {
                    id,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const getPendingInvites = async () => {
    if (!user) {
        return { data: null, error: "user not found" };
    }
    const { data, error } = await supabase
        .from("groups_invites")
        .select(`
            id,            
            groups (
                title
            ),
            created_by:created_by (
                email, firstname, lastname
            ),
            created_at
        `)
        .eq("email", user.email);

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
};
