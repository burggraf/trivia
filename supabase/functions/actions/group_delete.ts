import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string;
}
export const group_delete = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const id = payload.id;

        // Insert new group

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
                error: "User is not an admin of the group",
            };
        }

        // Insert new groups_users row
        const { data: deleteData, error: deleteError } = await supabase
            .from("groups")
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
