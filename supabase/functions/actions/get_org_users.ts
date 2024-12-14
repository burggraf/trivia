import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string;
}
export const get_org_users = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const id = payload.id;

        // Insert new org

        const { data: userRole, error: userRoleError } = await getUserRole(
            id,
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

        // Insert new orgs_users row
        const { data, error } = await supabase
            .rpc("get_org_users", { org_id: id });

        if (error) {
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
};
