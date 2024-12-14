import { supabase } from "./supabase_client.ts";
import type { User } from "@supabase/supabase-js";
export async function getUser(
    req: Request,
): Promise<{ user: User | null; authError: Error | null }> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        throw new Error("Missing Authorization header");
    }

    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabase.auth
        .getUser(
            authHeader.split(" ")[1],
        );
    if (authError || !user) {
        throw new Error("Unauthorized");
    }
    return { user, authError };
}
