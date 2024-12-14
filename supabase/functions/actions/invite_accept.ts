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
            .from("orgs_invites")
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

        // Start a transaction by creating the orgs_users record
        const { data: orgUserData, error: orgUserError } = await supabase
            .from("orgs_users")
            .insert({
                orgid: inviteData.orgid,
                userid: user.id,
                user_role: inviteData.user_role,
            })
            .select()
            .single();
        console.log("invite_accept orgUserData", orgUserData);
        console.log("invite_accept orgUserError", orgUserError);

        if (orgUserError) {
            console.log("invite_accept orgUserError", orgUserError);
            return { data: null, error: orgUserError.message };
        }

        // If successful, delete the invitation
        const { error: deleteError } = await supabase
            .from("orgs_invites")
            .delete()
            .eq("id", id);
        console.log("deleteError", deleteError);
        if (deleteError) {
            // If we can't delete the invite, we should probably clean up the orgs_users record
            // to maintain data consistency
            console.log("deleteError so deleting orgs_users record");
            const { error: deleteOrgsUsersError } = await supabase
                .from("orgs_users")
                .delete()
                .eq("org_id", inviteData.org_id)
                .eq("user_id", user.id);
            console.log(
                "deleteOrgsUsersError",
                deleteOrgsUsersError,
            );

            return { data: null, error: deleteOrgsUsersError.message };
        }
        console.log(
            "invite_accept orgUserData being returned here",
            orgUserData,
        );
        return { data: orgUserData, error: null };
    } catch (err) {
        console.log("invite_accept try/catch err", err);
        return { data: null, error: err };
    }
};
