import { getItemById, getList, getSession, getUser } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";

import type { Database } from "$lib/types/database.types";
import { handleServerFunctionResponse } from "$lib/utils/errorHandling";
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
    return handleServerFunctionResponse(response);
};
