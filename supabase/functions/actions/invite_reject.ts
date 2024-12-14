import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";

interface Payload {
    id: string | null;
}

export const invite_reject = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        const id = payload.id;
        if (!id) {
            return { data: null, error: "id not found" };
        }

        if (!user) {
            return { data: null, error: "User not found" };
        }

        // Check if the invite exists and is for this user
        const { data: inviteData, error: inviteError } = await supabase
            .from("groups_invites")
            .select("*")
            .eq("id", id)
            .eq("email", user.email)
            .single();

        if (inviteError) {
            return { data: null, error: inviteError.message };
        }

        if (!inviteData) {
            return {
                data: null,
                error: "Invite not found or not for this user",
            };
        }

        // Delete the invitation
        const { data: deleteData, error: deleteError } = await supabase
            .from("groups_invites")
            .delete()
            .eq("id", id)
            .select();

        if (deleteError) {
            return { data: null, error: deleteError.message };
        }

        return { data: deleteData, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
};
