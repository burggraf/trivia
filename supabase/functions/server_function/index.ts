import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import type { User } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/get_user.ts";

import { group_delete } from "../actions/group_delete.ts";
import { group_upsert } from "../actions/group_upsert.ts";
import { group_user_delete } from "../actions/group_user_delete.ts";
import { get_group_users } from "../actions/get_group_users.ts";
import { group_user_update_role } from "../actions/group_user_update_role.ts";
import { invite_insert } from "../actions/invite_insert.ts";
import { invite_delete } from "../actions/invite_delete.ts";
import { invite_accept } from "../actions/invite_accept.ts";
import { invite_reject } from "../actions/invite_reject.ts";
import { property_geocode } from "../actions/property_geocode.ts";
const actions = {
    group_delete,
    group_upsert,
    group_user_delete,
    get_group_users,
    group_user_update_role,
    invite_insert,
    invite_delete,
    invite_accept,
    invite_reject,
    property_geocode,
} as const;

type ActionKey = keyof typeof actions;

Deno.serve(async (req) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }

        const { user, authError } = await getUser(req);
        if (authError) {
            throw new Error(authError.message);
        }

        // call functions here...
        const body = await req.json();

        if (typeof body.action !== "string" || !(body.action in actions)) {
            throw new Error("Missing or invalid action parameter");
        }
        if (typeof body.payload !== "object") {
            throw new Error("Missing or invalid payload parameter");
        }

        // const { data, error } = await executeAction(action, payload, user);
        if (!actions[body.action as ActionKey]) {
            return new Response(
                JSON.stringify({
                    data: null,
                    error: "Invalid action: " + body.action,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }
        const { data, error } = await actions[body.action as ActionKey](
            body.payload,
            user,
        );

        return new Response(
            JSON.stringify({ data, error }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (err) {
        console.error("Function error in try/catch block:", err);
        let message = "unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        return new Response(
            JSON.stringify({ data: null, error: message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: message === "Unauthorized" ? 401 : 500,
            },
        );
    }
});
