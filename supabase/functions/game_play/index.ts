import { corsHeaders } from "../_shared/cors.ts";
import { handleAnswer } from "./lib/answer-handler.ts";
import { initializeGame } from "./lib/game-init.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const result = await initializeGame(req);
        if (result instanceof Response) {
            return result;
        }
        const { questions, channel, userid, gameid } = result;
        handleAnswer(channel, gameid, userid);

        return new Response(
            JSON.stringify({
                data: { questions },
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
