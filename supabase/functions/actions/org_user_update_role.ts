import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string; // orgs_users id
    user_role: string;
}
export const org_user_update_role = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const id = payload.id;
        const user_role = payload.user_role;

        // get the org for this orgs_users record
        const { data: org, error: orgError } = await supabase
            .from("orgs_users")
            .select("orgid")
            .eq("id", id)
            .single();
        if (orgError) {
            return { data: null, error: orgError };
        }
        const orgid = org.orgid;
        if (!orgid) {
            return { data: null, error: "Org not found" };
        }

        if (orgid) {
            const { data: userRole, error: userRoleError } = await getUserRole(
                orgid,
                user.id,
            );
            if (userRoleError) {
                return { data: null, error: userRoleError };
            }
            if (userRole !== "Admin") {
                return {
                    data: null,
                    error: "User is not an admin of the organization",
                };
            }
        }

        // Insert new orgs_users row
        const { data: updateData, error: updateError } = await supabase
            .from("orgs_users")
            .update({ user_role })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            return { data: null, error: updateError };
        } else {
            return { data: updateData, error: null };
        }
    } catch (err) {
        return { data: null, error: err };
    }
};
