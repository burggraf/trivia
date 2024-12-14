import { createClient } from "@supabase/supabase-js";
import { decryptData } from "$lib/services/crypto";
export const supabase = createClient(
    decryptData(
        __SUPABASE_URL_ENCRYPTED__,
        __SUPABASE_URL_ENCRYPTION_KEY__,
    ),
    decryptData(
        __SUPABASE_ANON_KEY_ENCRYPTED__,
        __SUPABASE_ANON_KEY_ENCRYPTION_KEY__,
    ),
);
