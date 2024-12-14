import type { Database } from "$lib/types/database.types";
import { supabase } from "./backend.svelte.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Group } from "./backend.svelte.ts";
import { getCurrentGroup, getUser } from "./backend.svelte.ts";
const user: User | null = $derived(getUser());
const currentGroup: Group | null = $derived(getCurrentGroup());

export type Property = Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyContact =
    Database["public"]["Tables"]["properties_contacts"]["Insert"];

export async function getGroupProperties(groupId: string): Promise<{
    data: Property[] | null;
    error: Error | null;
}> {
    if (!groupId) {
        return { data: null, error: new Error("No group selected") };
    }

    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("groupid", groupId)
        .order("created_at", { ascending: false });

    return { data, error };
}

export async function upsertProperty(
    user: User,
    groupId: string,
    property: Partial<Property>,
): Promise<{ data: Property | null; error: Error | null }> {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view properties"),
        };
    }

    if (!groupId) {
        return { data: null, error: new Error("No group selected") };
    }

    // Ensure the property is associated with the current group
    const propertyWithGroup = {
        ...property,
        groupid: groupId,
        userid: user.id,
    };

    const { data, error } = await supabase
        .from("properties")
        .upsert(propertyWithGroup)
        .select()
        .single();

    if (data && !property.id) {
        // If this is a new property (no ID), trigger geocoding
        const geocodeResponse = await supabase.functions.invoke(
            "server_function",
            {
                body: {
                    action: "property_geocode",
                    payload: { id: data.id },
                },
            },
        );
        console.log("geocodeResponse", geocodeResponse);
        // We don't need to wait for or handle the geocoding response
        // as it will update the database asynchronously
    }

    return { data, error };
}

export async function getPropertyById(
    propertyId: string,
): Promise<{ data: Property | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

    return { data, error };
}

export async function getPropertyContactsByPropertyId(
    propertyId: string,
): Promise<{ data: PropertyContact[] | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("properties_contacts")
        .select(`
            *,
            contacts (
                id,
                email,
                firstname,
                lastname,
                phone,
                created_at
            )
        `)
        .eq("propertyid", propertyId);

    return { data, error };
}

export async function upsertPropertyContact(
    contact: Partial<PropertyContact>,
): Promise<{ data: PropertyContact | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("properties_contacts")
        .upsert(contact)
        .select()
        .single();

    return { data, error };
}

export async function deletePropertyContact(
    id: string,
): Promise<{ data: PropertyContact | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("properties_contacts")
        .delete()
        .eq("id", id)
        .select()
        .single();

    return { data, error };
}
