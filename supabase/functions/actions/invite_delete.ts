import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
// import type { Invite } from "$lib/services/inviteService.svelte.ts";
interface Payload {
    id: string | null;
}
export const invite_delete = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        const id = payload.id;
        if (!id) {
            return { data: null, error: "id not found" };
        }

        // check to make sure the user is the creator of the groups_invites row
        const { data: inviteCreatedByData, error: inviteCreatedByError } =
            await supabase
                .from("groups_invites")
                .select("created_by")
                .eq("id", id)
                .single();

        if (inviteCreatedByError) {
            return { data: null, error: inviteCreatedByError.message };
        }
        if (!user) {
            return { data: null, error: "User not found" };
        }
        if (inviteCreatedByData.created_by !== user.id) {
            return {
                data: null,
                error: "User is not the creator of this invite",
            };
        }
        // Insert new groups_users row
        const { data: deleteData, error: deleteError } = await supabase
            .from("groups_invites")
            .delete()
            .eq("id", id)
            .select();

        if (deleteError) {
            return { data: null, error: deleteError.message };
        } else {
            return { data: deleteData, error: null };
        }
    } catch (err) {
        return { data: null, error: err };
    }
};
