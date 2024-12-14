import { getItemById, getList, getSession, getUser } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";
import type { Database } from "$lib/types/database.types";
import { handleServerFunctionResponse } from "$lib/utils/errorHandling";
//export type Org = Database["public"]["Tables"]["orgs"]["Insert"];
interface Org {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
}
const user = $derived(getUser());
//import type { Org } from "$lib/types/org.ts";
//import type { Database } from "$lib/types/database.types";

export async function fetchOrgs() {
    const { data, error } = await supabase.rpc("get_my_orgs");
    return { data, error };
}

export const getOrgById: any = async (id: string) => {
    if (!user) {
        return { data: null, error: "user not found" };
    }
    const { data, error } = await supabase
        .from("orgs_users")
        .select(`
            user_role,
            orgs (
                id,
                title,
                created_at,
                metadata
            )
            `)
        .eq("orgid", id)
        .eq("userid", user.id);
    if (error) {
        return { data: null, error };
    } else if (data) {
        // transform the data to match the Org interface
        const transformedData = data.map((org: any) => ({
            id: org.orgs.id,
            title: org.orgs.title,
            created_at: org.orgs.created_at,
            metadata: org.orgs.metadata,
            user_role: org.user_role,
        }));
        return { data: transformedData[0], error };
    } else {
        return { data: null, error: "Org not found" };
    }
};

export const getMyRoleInOrg = async (orgId: string) => {
    const { data: sessionData, error: sessionError } = await getSession();
    const { data, error } = await supabase
        .from("orgs_users")
        .select("user_role")
        .eq("orgid", orgId)
        .eq("userid", sessionData?.session?.user?.id)
        .limit(1)
        .single();
    return { data: data?.user_role, error };
};

export const saveOrg = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "org_upsert",
                payload: {
                    id: org.id === "new" ? null : org.id,
                    title: org.title,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteOrg = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "org_delete", payload: { id: org.id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const updateUserRole = async (
    orgs_users_id: string,
    new_user_role: string,
) => {
    if (!orgs_users_id || !new_user_role) {
        return {
            data: null,
            error: "orgs_users_id or new_user_role not provided",
        };
    }
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "org_user_update_role",
                payload: { id: orgs_users_id, user_role: new_user_role },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteOrgUser = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "org_user_delete", payload: { id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const getOrgUsers = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "get_org_users", payload: { id: org.id } },
        },
    );
    return handleServerFunctionResponse(response);
};
