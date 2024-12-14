import type { Database } from "$lib/types/database.types";
import { supabase } from "./backend.svelte.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { getUser } from "$lib/services/backend.svelte.ts";
const user = $derived(getUser());
export type Profile = Database["public"]["Tables"]["profiles"]["Insert"];

export const getProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select(
        "id, email, firstname, lastname, bio, metadata",
    ).order("email", { ascending: true });
    return { data, error };
};
