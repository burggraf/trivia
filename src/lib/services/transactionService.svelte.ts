import type { Database } from "$lib/types/database.types";
import { supabase } from "./backend.svelte.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { getUser } from "$lib/services/backend.svelte.ts";
import { getCurrentOrg } from "./backend.svelte.ts";
import type { Org } from "./backend.svelte.ts";
const user = $derived(getUser());
const currentOrg: Org | null = $derived(getCurrentOrg());

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

    if (!currentOrg?.id) {
        return { data: null, error: new Error("No organization selected") };
    }

    // Ensure the transaction is associated with the current org
    const transactionWithOrg = {
        ...transaction,
        orgid: currentOrg.id,
        userid: user.id,
    };

    const { data, error } = await supabase
        .from("transactions")
        .upsert(transactionWithOrg)
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

    if (!currentOrg?.id) {
        return { data: null, error: new Error("No organization selected") };
    }

    // Ensure the transaction is associated with the current org
    const transactionEventWithOrg = {
        ...transactionEvent,
        orgid: currentOrg.id,
        userid: user.id,
    };

    const { data, error } = await supabase
        .from("transactions_events")
        .upsert(transactionEventWithOrg)
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
