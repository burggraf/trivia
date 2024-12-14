import type { Database } from "$lib/types/database.types";
import { supabase } from "./backend.svelte.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { getUser } from "$lib/services/backend.svelte.ts";
const user = $derived(getUser());

export type Message = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageRecipient =
    Database["public"]["Tables"]["messages_recipients"]["Insert"];

export const getNewInboxMessageCount = async () => {
    if (!user) {
        return {
            data: null,
            error: "getNewInboxMessageCount: User not logged in",
        };
    }
    const { count, error } = await supabase
        .from("messages_recipients")
        .select("*", { count: "exact", head: true })
        .eq("recipient", user.id)
        .is("read_at", null);
    return { data: count, error };
};

export const getInboxMessages = async (
    start: number = 0,
    count: number = 100,
) => {
    if (!user) return { data: null, error: "User not logged in" };
    const { data, error } = await supabase
        .from("messages")
        .select(`
            id,
            created_at,
            subject,
            message,
            sender,
            sender_profile:profiles!inner(
                firstname,
                lastname,
                email
            ),
            metadata,
            messages_recipients!inner (
                recipient,
                read_at,
                deleted_at
            )
        `)
        .eq("messages_recipients.recipient", user.id)
        .is("messages_recipients.deleted_at", null)
        .range(start, start + count)
        .limit(count)
        .order("created_at", { ascending: false });

    // Transform remains the same
    const transformedData = data?.map((msg: any) => ({
        ...msg,
        // Start of Selection
        created_at: new Date(msg.created_at).toLocaleString(),
        read_at: new Date(msg.messages_recipients[0].read_at)
            .toLocaleString(),
        // Sender info
        sender_firstname: msg.sender_profile?.firstname,
        sender_lastname: msg.sender_profile?.lastname,
        sender_email: msg.sender_profile?.email,
    }));

    return { data: transformedData, error };
};

export const getSentMessages = async (
    start: number = 0,
    count: number = 100,
) => {
    if (!user) return { data: null, error: "User not logged in" };
    const { data, error } = await supabase
        .from("messages")
        .select(`
            id,
            created_at,
            subject,
            message,
            sender,
            metadata,
            messages_recipients!inner (
                recipient,
                read_at,
                deleted_at,
                profiles:recipient (
                    firstname,
                    lastname,
                    email
                )
            )
        `)
        .eq("sender", user.id)
        .is("sender_deleted_at", null)
        .range(start, start + count)
        .limit(count)
        .order("created_at", { ascending: false });

    // Transform the data with renamed recipients array and flattened profile info
    const transformedData = data?.map((msg) => ({
        ...msg,
        created_at: msg.created_at ? new Date(msg.created_at).toLocaleString() : '',
        recipients: msg.messages_recipients.map((recipient: any) => ({
            recipient: recipient.recipient,
            read_at: recipient.read_at ? new Date(recipient.read_at).toLocaleString() : 'Unread',
            email: recipient.profiles?.email ?? 'Unknown',
            firstname: recipient.profiles?.firstname ?? '',
            lastname: recipient.profiles?.lastname ?? '',
        })),
        messages_recipients: undefined, // Remove the original messages_recipients array
    }));

    return { data: transformedData, error };
};

export const markMessageAsRead = async (id: string) => {
    if (!user) return { data: null, error: "User not logged in" };
    const { error } = await supabase
        .from("messages_recipients")
        .update({ read_at: new Date().toISOString() })
        .eq("messageid", id)
        .eq("recipient", user.id);
};
export const markMessageAsUnread = async (id: string) => {
    if (!user) return { data: null, error: "User not logged in" };
    const { error } = await supabase
        .from("messages_recipients")
        .update({ read_at: null })
        .eq("messageid", id)
        .eq("recipient", user.id);
};
export const getMessage = async (id: string) => {
    if (!user) return { data: null, error: "User not logged in" };
    const { data, error } = await supabase
        .from("messages")
        .select(`
            id,
            created_at,
            subject,
            message,
            sender,
            sender_profile:profiles!inner(
                firstname,
                lastname,
                email
            ),            
            metadata,
            messages_recipients!inner (
                recipient,
                read_at,
                deleted_at,
                profiles:recipient (
                    firstname,
                    lastname,
                    email
                )
            )
        `)
        .eq("id", id)
        .single();
    // Transform the data to match the previous structure
    const transformedData = data
        ? {
            ...data,
            recipient: data.messages_recipients[0].recipient,
            read_at: data.messages_recipients[0].read_at,
        }
        : null;

    return { data: transformedData, error };
};

export const deleteMessage = async (id: string) => {
    let errorMessage = "";
    if (!user) return { data: null, error: "User not logged in" };
    // delete the message as a recipeient
    const { error: error1 } = await supabase
        .from("messages_recipients")
        .update({ deleted_at: new Date().toISOString() })
        .eq("messageid", id)
        .eq("recipient", user.id);
    if (error1) errorMessage = error1.message;

    // delete the message as a sender
    const { error: error2 } = await supabase
        .from("messages")
        .update({ sender_deleted_at: (new Date()).toISOString() })
        .eq("id", id);
    if (error2) errorMessage += " " + error2.message;

    return { data: null, error: errorMessage.length > 0 ? errorMessage : null };
};

export const createMessage = async (
    message: Omit<Message, "recipient">,
    recipientIds: string[],
) => {
    if (!user) return { data: null, error: "User not logged in" };
    if (!message.sender) message.sender = user.id;
    if (recipientIds.length === 0) {
        return { data: null, error: "At least one recipient is required" };
    }
    if (!message.subject) return { data: null, error: "Subject is required" };
    if (!message.message) return { data: null, error: "Message is required" };

    // Start a Supabase transaction
    const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert(message)
        .select()
        .single();

    if (messageError) return { data: null, error: messageError };

    // Create recipient records
    const recipientRecords = recipientIds.map((recipientId) => ({
        messageid: messageData.id,
        recipient: recipientId,
    }));

    const { error: recipientsError } = await supabase
        .from("messages_recipients")
        .insert(recipientRecords);

    if (recipientsError) {
        // If creating recipients failed, we should ideally delete the message
        // but Supabase doesn't support true transactions across tables
        return { data: null, error: recipientsError };
    }

    return { data: messageData, error: null };
};
