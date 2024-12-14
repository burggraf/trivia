import { supabase } from "./supabase_client.ts";

export const getUserRole = async (groupid: string, userid: string) => {
    const { data: userRoleData, error: userRoleError } = await supabase
        .from("groups_users")
        .select("user_role")
        .eq("groupid", groupid)
        .eq("userid", userid)
        .single();
    if (userRoleError) {
        return { data: null, error: userRoleError };
    }
    return {
        data: userRoleData.user_role,
        error: "",
    };
};
