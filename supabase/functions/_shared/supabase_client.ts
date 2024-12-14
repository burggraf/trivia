import { createClient } from "jsr:@supabase/supabase-js@2";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
);

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing environment variables");
}

// Create Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
