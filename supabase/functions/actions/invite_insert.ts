import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
// import type { Invite } from "$lib/services/inviteService.svelte.ts";
interface Payload {
    orgid: string | null;
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
        const { orgid, email, user_role } = payload;
        if (!orgid || typeof orgid !== "string") {
            return { data: null, error: "orgid is required" };
        }
        if (!email || typeof email !== "string") {
            return { data: null, error: "email is required" };
        }
        if (!user_role || typeof user_role !== "string") {
            return { data: null, error: "user_role is required" };
        }

        // check to make sure the user is an admin of the org
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
        // make sure user_role is a valid user role
        if (
            user_role !== "Admin" &&
            user_role !== "Member" &&
            user_role !== "Manager" &&
            user_role !== "Viewer"
        ) {
            return { data: null, error: "user_role is not valid" };
        }
        // check to make sure the email is not already in the orgs_invites table
        const { data: existingUser, error: existingUserError } = await supabase
            .from("orgs_invites")
            .select("*")
            .eq("email", email)
            .eq("orgid", orgid);
        if (existingUserError) {
            return { data: null, error: existingUserError };
        }
        if (existingUser.length > 0) {
            return {
                data: null,
                error: "invite already exists for this email",
            };
        }

        // Insert new orgs_users row
        const { data: insertData, error: insertError } = await supabase
            .from("orgs_invites")
            .insert({
                orgid: orgid,
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
