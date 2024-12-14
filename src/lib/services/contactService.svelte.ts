import type { Database } from "$lib/types/database.types";
import { supabase } from "./backend.svelte.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";

import { getUser } from "$lib/services/backend.svelte.ts";
import { getCurrentGroup } from "./backend.svelte.ts";
import type { Group } from "./backend.svelte.ts";
const user = $derived(getUser());
const currentGroup: Group | null = $derived(getCurrentGroup());
export type Contact = Database["public"]["Tables"]["contacts"]["Insert"];

export const getContacts = async () => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    const { data, error } = await supabase.from("contacts").select(
        "id, email, firstname, lastname, phone, created_at",
    ).eq("groupid", currentGroup?.id)
        .order("lastname", { ascending: true })
        .order("firstname", { ascending: true });
    return { data, error };
};

export const upsertContact = async (contact: Partial<Contact>) => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    const contactWithGroup = {
        ...contact,
        groupid: currentGroup.id,
    };
    const { data, error } = await supabase
        .from("contacts")
        .upsert(contactWithGroup)
        .select()
        .single();

    if (error) {
        console.error("Failed to upsert contact:", error);
    } else {
        console.log("Successfully upserted contact:", data);
    }

    return { data, error };
};

export const deleteContact = async (id: string) => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    const { data, error } = await supabase.from("contacts").delete().eq(
        "id",
        id,
    );
    return { data, error };
};

export const getContactById = async (id: string) => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    const { data, error } = await supabase.from("contacts").select("*").eq(
        "id",
        id,
    );
    return { data, error };
};

export const getContactByEmail = async (email: string) => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    const { data, error } = await supabase.from("contacts").select("*").eq(
        "email",
        email,
    ).eq("groupid", currentGroup?.id).limit(1).single();
    return { data, error };
};

export const searchContacts = async (query: string) => {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view contacts"),
        };
    }
    if (!currentGroup?.id) {
        return { data: null, error: new Error("No groupanization selected") };
    }
    if (!query) {
        return { data: [], error: null };
    } else {
        query = query.trim();
    }
    const { data, error } = await supabase
        .from("contacts")
        .select("id, email, firstname, lastname, phone, created_at")
        .eq("groupid", currentGroup?.id)
        .or(
            `email.ilike.%${query}%,firstname.ilike.%${query}%,lastname.ilike.%${query}%`,
        )
        .order("lastname", { ascending: true })
        .order("firstname", { ascending: true });
    return { data, error };
};
