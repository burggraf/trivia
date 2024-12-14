import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
// import type { Invite } from "$lib/services/inviteService.svelte.ts";
interface Payload {
    groupid: string | null;
    email: string | null;
    user_role: string | null;
}
export const invite_insert = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const { groupid, email, user_role } = payload;
        if (!groupid || typeof groupid !== "string") {
            return { data: null, error: "groupid is required" };
        }
        if (!email || typeof email !== "string") {
            return { data: null, error: "email is required" };
        }
        if (!user_role || typeof user_role !== "string") {
            return { data: null, error: "user_role is required" };
        }

        // check to make sure the user is an admin of the group
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
                error: "User is not an admin of the groupanization",
            };
        }
        // make sure user_role is a valid user role
        if (
            user_role !== "Admin" &&
            user_role !== "Member" &&
            user_role !== "Manager" &&
            user_role !== "Viewer"
        ) {
            return { data: null, error: "user_role is not valid" };
        }
        // check to make sure the email is not already in the groups_invites table
        const { data: existingUser, error: existingUserError } = await supabase
            .from("groups_invites")
            .select("*")
            .eq("email", email)
            .eq("groupid", groupid);
        if (existingUserError) {
            return { data: null, error: existingUserError };
        }
        if (existingUser.length > 0) {
            return {
                data: null,
                error: "invite already exists for this email",
            };
        }

        // Insert new groups_users row
        const { data: insertData, error: insertError } = await supabase
            .from("groups_invites")
            .insert({
                groupid: groupid,
                created_by: user.id,
                email: email,
                user_role: user_role,
            })
            .select()
            .single();

        if (insertError) {
            return { data: null, error: insertError };
        } else {
            return { data: insertData, error: null };
        }
    } catch (err) {
        return { data: null, error: err };
    }
};
