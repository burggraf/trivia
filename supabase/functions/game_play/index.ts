import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/get_user.ts";
import { supabase } from "../_shared/supabase_client.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Get the current user ID
        const { user, authError } = await getUser(req);
        if (authError || !user) {
            console.log("User not logged in");
            return new Response(
                JSON.stringify({ error: "User not logged in" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 401,
                },
            );
        }
        const userid = user.id;

        // 2. Get the gameid from the request body
        const { gameid } = await req.json();
        console.log("gameid", gameid);
        console.log("userid", userid);

        if (!gameid) {
            console.log("gameid is required");
            return new Response(
                JSON.stringify({ error: "gameid is required" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        // 3. Get the game record from the games table
        const { data: game, error: gameError } = await supabase
            .from("games")
            .select("*")
            .eq("id", gameid)
            .single();

        if (gameError || !game) {
            console.log("Failed to get game record");
            return new Response(
                JSON.stringify({ error: "Failed to get game record" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }

        // 4. Get the first question ID from the questions array
        const questionId = game.questions?.[0];
        if (!questionId) {
            console.log("No questions found in game");
            return new Response(
                JSON.stringify({ error: "No questions found in game" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        // 5. Get the question data from the questions table
        const { data: question, error: questionError } = await supabase
            .from("questions")
            .select("a, b, c, d, question")
            .eq("id", questionId)
            .single();

        if (questionError || !question) {
            console.log("Failed to get question data");
            return new Response(
                JSON.stringify({ error: "Failed to get question data" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }

        // 6. Get the games_keys record
        const { data: gameKeys, error: gameKeysError } = await supabase
            .from("games_keys")
            .select("keys")
            .eq("id", gameid)
            .single();

        if (gameKeysError || !gameKeys) {
            console.log("Failed to get game keys record");
            return new Response(
                JSON.stringify({ error: "Failed to get game keys record" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }

        // 7. Order the answers based on the key
        const key = gameKeys.keys[0];
        const answers = {
            a: question[key[0] as "a" | "b" | "c" | "d"],
            b: question[key[1] as "a" | "b" | "c" | "d"],
            c: question[key[2] as "a" | "b" | "c" | "d"],
            d: question[key[3] as "a" | "b" | "c" | "d"],
        };

        // 8. Update the game record with the question and question_number
        const { error: updateError } = await supabase
            .from("games")
            .update({
                metadata: {
                    question: question.question,
                    question_number: 0,
                    answers,
                },
            })
            .eq("id", gameid);

        if (updateError) {
            console.log("Failed to update game record");
            return new Response(
                JSON.stringify({ error: "Failed to update game record" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }

        console.log("Game play function executed successfully");
        return new Response(
            JSON.stringify({
                data: { message: "Game play function executed successfully" },
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
