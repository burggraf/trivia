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

export type Transaction =
    Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionEvent =
    Database["public"]["Tables"]["transactions_events"]["Insert"];

export async function upsertTransaction(
    transaction: Partial<Transaction>,
): Promise<{ data: Transaction | null; error: Error | null }> {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view transactions"),
        };
    }

    if (!currentGroup?.id) {
        return { data: null, error: new Error("No group selected") };
    }

    // Ensure the transaction is associated with the current group
    const transactionWithGroup = {
        ...transaction,
        groupid: currentGroup.id,
        userid: user.id,
    };

    const { data, error } = await supabase
        .from("transactions")
        .upsert(transactionWithGroup)
        .select()
        .single();

    return { data, error };
}

export async function upsertTransactionEvent(
    transactionEvent: Partial<TransactionEvent>,
): Promise<{ data: TransactionEvent | null; error: Error | null }> {
    if (!user) {
        return {
            data: null,
            error: new Error("You need to be logged in to view transactions"),
        };
    }

    if (!currentGroup?.id) {
        return { data: null, error: new Error("No group selected") };
    }

    // Ensure the transaction is associated with the current group
    const transactionEventWithGroup = {
        ...transactionEvent,
        groupid: currentGroup.id,
        userid: user.id,
    };

    const { data, error } = await supabase
        .from("transactions_events")
        .upsert(transactionEventWithGroup)
        .select()
        .single();

    return { data, error };
}
export async function getPropertyTransactions(
    propertyId: string,
): Promise<{ data: Transaction[] | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("propertyid", propertyId)
        .order("created_at", { ascending: false });

    return { data, error };
}
