import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";

interface Payload {
    id: string | null;
}

export const invite_accept = async (
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

        console.log("invite_accept id", id);
        // Check if the invite exists and get its details
        const { data: inviteData, error: inviteError } = await supabase
            .from("groups_invites")
            .select("*")
            .eq("id", id)
            .eq("email", user.email)
            .single();
        console.log("invite_accept inviteData", inviteData);
        console.log("invite_accept inviteError", inviteError);
        if (inviteError) {
            return { data: null, error: inviteError.message };
        }

        if (!inviteData) {
            console.log("invite_accept inviteData not found");
            return {
                data: null,
                error: "Invite not found or not for this user",
            };
        }

        // Start a transaction by creating the groups_users record
        const { data: groupUserData, error: groupUserError } = await supabase
            .from("groups_users")
            .insert({
                groupid: inviteData.groupid,
                userid: user.id,
                user_role: inviteData.user_role,
            })
            .select()
            .single();
        console.log("invite_accept groupUserData", groupUserData);
        console.log("invite_accept groupUserError", groupUserError);

        if (groupUserError) {
            console.log("invite_accept groupUserError", groupUserError);
            return { data: null, error: groupUserError.message };
        }

        // If successful, delete the invitation
        const { error: deleteError } = await supabase
            .from("groups_invites")
            .delete()
            .eq("id", id);
        console.log("deleteError", deleteError);
        if (deleteError) {
            // If we can't delete the invite, we should probably clean up the groups_users record
            // to maintain data consistency
            console.log("deleteError so deleting groups_users record");
            const { error: deleteGroupsUsersError } = await supabase
                .from("groups_users")
                .delete()
                .eq("group_id", inviteData.group_id)
                .eq("user_id", user.id);
            console.log(
                "deleteGroupsUsersError",
                deleteGroupsUsersError,
            );

            return { data: null, error: deleteGroupsUsersError.message };
        }
        console.log(
            "invite_accept groupUserData being returned here",
            groupUserData,
        );
        return { data: groupUserData, error: null };
    } catch (err) {
        console.log("invite_accept try/catch err", err);
        return { data: null, error: err };
    }
};
