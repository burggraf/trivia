import { getItemById, getList, getSession, getUser } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";

import type { Database } from "$lib/types/database.types";
//export type Group = Database["public"]["Tables"]["groups"]["Insert"];
const user = $derived(getUser());
//import type { Group } from "$lib/types/group.ts";
//import type { Database } from "$lib/types/database.types";

export const createGame = async (groupId: string) => {
    const response = await supabase.functions.invoke(
        "game_create",
        {
            body: {
                groupid: groupId,
            },
        },
    );
    return response;
};
export const getOpenGamesForGroup = async (groupId: string) => {
    const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("groupid", groupId)
        .eq("gamestate", "open");

    return { data, error };
};

export const fetchGame = async (gameId: string) => {
    const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
    if (error) {
        console.error("Error fetching game:", error);
        return null;
    }
    return data;
};
