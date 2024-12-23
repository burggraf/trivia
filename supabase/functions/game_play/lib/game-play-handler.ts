import { corsHeaders } from "../../_shared/cors.ts";
import { getUser } from "../../_shared/get_user.ts";
import { supabase } from "../../_shared/supabase_client.ts";
import { setupGameChannel } from "./game-channel-handler.ts";

export async function handleGamePlay(req: Request) {
    // 1. Get the current user ID
    const { user, authError } = await getUser(req);
    if (authError || !user) {
        console.log("User not logged in");
        return new Response(JSON.stringify({ error: "User not logged in" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
        });
    }
    const userid = user.id;

    // 2. Get the gameid from the request body
    const { gameid } = await req.json();
    console.log("gameid", gameid);
    console.log("userid", userid);

    if (!gameid) {
        console.log("gameid is required");
        return new Response(JSON.stringify({ error: "gameid is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }

    // 3. Get the game record from the games table
    const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("metadata, gamestate")
        .eq("id", gameid)
        .single();

    if (gameError || !gameData) {
        console.log("Failed to get game record");
        return new Response(
            JSON.stringify({ error: "Failed to get game record" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }

    // 4. Get the questions from the metadata
    const questions = gameData.metadata?.questions;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.log("No questions found in game metadata");
        return new Response(
            JSON.stringify({ error: "No questions found in game metadata" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            },
        );
    }

    const channel = supabase.channel(gameid);

    // Update the game state to "started"
    const { error: updateError } = await supabase
        .from("games")
        .update({ gamestate: "started" })
        .eq("id", gameid);

    if (updateError) {
        console.error("Error updating game state:", updateError);
        return new Response(
            JSON.stringify({ error: "Error updating game state" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }

    const game = {
        channel,
        id: gameid,
        questions,
        gamestate: gameData.gamestate,
    };

    await setupGameChannel(game);
}
