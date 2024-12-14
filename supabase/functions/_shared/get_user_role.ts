import { supabase } from "./supabase_client.ts";

export const getUserRole = async (orgid: string, userid: string) => {
    const { data: userRoleData, error: userRoleError } = await supabase
        .from("orgs_users")
        .select("user_role")
        .eq("orgid", orgid)
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
