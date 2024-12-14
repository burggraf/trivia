import { getItemById, getList, getSession, getUser } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";

import type { Database } from "$lib/types/database.types";
import { handleServerFunctionResponse } from "$lib/utils/errorHandling";
//export type Group = Database["public"]["Tables"]["groups"]["Insert"];
export interface Group {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
}
const user = $derived(getUser());
//import type { Group } from "$lib/types/group.ts";
//import type { Database } from "$lib/types/database.types";

export async function fetchGroups() {
    const { data, error } = await supabase.rpc("get_my_groups");
    return { data, error };
}

export const getGroupById: any = async (id: string) => {
    if (!user) {
        return { data: null, error: "user not found" };
    }
    const { data, error } = await supabase
        .from("groups_users")
        .select(`
            user_role,
            groups (
                id,
                title,
                created_at,
                metadata
            )
            `)
        .eq("groupid", id)
        .eq("userid", user.id);
    if (error) {
        return { data: null, error };
    } else if (data) {
        // transform the data to match the Group interface
        const transformedData = data.map((group: any) => ({
            id: group.groups.id,
            title: group.groups.title,
            created_at: group.groups.created_at,
            metadata: group.groups.metadata,
            user_role: group.user_role,
        }));
        return { data: transformedData[0], error };
    } else {
        return { data: null, error: "Group not found" };
    }
};

export const getMyRoleInGroup = async (groupId: string) => {
    const { data: sessionData, error: sessionError } = await getSession();
    const { data, error } = await supabase
        .from("groups_users")
        .select("user_role")
        .eq("groupid", groupId)
        .eq("userid", sessionData?.session?.user?.id)
        .limit(1)
        .single();
    return { data: data?.user_role, error };
};

export const saveGroup = async (group: Group) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "group_upsert",
                payload: {
                    id: group.id === "new" ? null : group.id,
                    title: group.title,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteGroup = async (group: Group) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "group_delete", payload: { id: group.id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const updateUserRole = async (
    groups_users_id: string,
    new_user_role: string,
) => {
    if (!groups_users_id || !new_user_role) {
        return {
            data: null,
            error: "groups_users_id or new_user_role not provided",
        };
    }
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "group_user_update_role",
                payload: { id: groups_users_id, user_role: new_user_role },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteGroupUser = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "group_user_delete", payload: { id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const getGroupUsers = async (group: Group) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "get_group_users", payload: { id: group.id } },
        },
    );
    return handleServerFunctionResponse(response);
};
