import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string; // groups_users id
    user_role: string;
}
export const group_user_update_role = async (
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

        // get the group for this groups_users record
        const { data: group, error: groupError } = await supabase
            .from("groups_users")
            .select("groupid")
            .eq("id", id)
            .single();
        if (groupError) {
            return { data: null, error: groupError };
        }
        const groupid = group.groupid;
        if (!groupid) {
            return { data: null, error: "Group not found" };
        }

        if (groupid) {
            const { data: userRole, error: userRoleError } = await getUserRole(
                groupid,
                user.id,
            );
            if (userRoleError) {
                return { data: null, error: userRoleError };
            }
            if (userRole !== "Admin") {
                return {
                    data: null,
                    error: "User is not an admin of the group",
                };
            }
        }

        // Insert new groups_users row
        const { data: updateData, error: updateError } = await supabase
            .from("groups_users")
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
