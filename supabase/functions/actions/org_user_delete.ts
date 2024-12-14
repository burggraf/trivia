import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string; // the id of the groups_users record
}
export const group_user_delete = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const id = payload.id;
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
                error: "User is not an admin of the ",
            };
        }

        // Insert new groups_users row
        const { data: deleteData, error: deleteError } = await supabase
            .from("groups_users")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (deleteError) {
            return { data: null, error: deleteError };
        }

        return { data: deleteData, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
};
