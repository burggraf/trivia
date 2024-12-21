import { corsHeaders } from "../_shared/cors.ts";
import { handleGamePlay } from "./lib/game-play-handler.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        await handleGamePlay(req);
        return new Response(
            JSON.stringify({
                data: { message: "Game play started" },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
