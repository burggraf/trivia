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
        .in("gamestate", ["open", "started"]);

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

export const saveAnswer = async (
    gameId: string,
    questionId: string,
    answer: string,
    questionIndex: number,
) => {
    if (!user) {
        console.error("User not logged in");
        return;
    }
    const userId = user.id;
    console.log(
        "saveAnswer: userId, gameId, questionId, answer, questionIndex",
        userId,
        gameId,
        questionId,
        answer,
        questionIndex,
    );
    const { data, error } = await supabase
        .rpc("insert_game_answer", {
            p_userid: userId,
            p_gameid: gameId,
            p_questionid: questionId,
            p_answer: answer,
            p_question_index: questionIndex,
        })
        .select("*")
        .single();

    if (error) {
        console.error("Error saving answer:", error);
    }
    return data;
};

export const getGameStatus = async (gameId: string) => {
    const { data, error } = await supabase.rpc("get_game_status", {
        p_gameid: gameId,
    }).single();

    if (error) {
        console.error("Error fetching game status:", error);
        return null;
    }
    return data;
};
