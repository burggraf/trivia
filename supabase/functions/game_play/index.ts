import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/get_user.ts";
import { supabase } from "../_shared/supabase_client.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const gameTimers = new Map<
    string,
    {
        currentQuestionIndex: number;
        nextQuestionTime: number;
        questionInterval: number;
    }
>();
const QUESTION_INTERVAL = 10000; // 10 seconds

function setGameTimer(gameid: string, numberOfQuestions: number) {
    if (!gameTimers.has(gameid)) {
        gameTimers.set(gameid, {
            currentQuestionIndex: 0,
            nextQuestionTime: Date.now() + QUESTION_INTERVAL,
            questionInterval: QUESTION_INTERVAL,
        });
    }
}

function clearGameTimer(gameid: string) {
    gameTimers.delete(gameid);
}

async function updateGameQuestion(
    gameid: string,
    currentQuestionIndex: number,
) {
    const { error } = await supabase
        .from("games")
        .update({
            metadata: { currentQuestionIndex },
        })
        .eq("id", gameid);

    if (error) {
        console.error("Failed to update game metadata:", error);
    }
}

setInterval(async () => {
    for (const [gameid, timer] of gameTimers.entries()) {
        if (Date.now() >= timer.nextQuestionTime) {
            const nextIndex = timer.currentQuestionIndex + 1;
            const { data: game, error: gameError } = await supabase
                .from("games")
                .select("questions")
                .eq("id", gameid)
                .single();

            if (gameError || !game || !game.questions) {
                console.error("Error fetching game questions:", gameError);
                clearGameTimer(gameid);
                continue;
            }

            if (nextIndex < game.questions.length) {
                timer.currentQuestionIndex = nextIndex;
                timer.nextQuestionTime = Date.now() + timer.questionInterval;
                await updateGameQuestion(gameid, timer.currentQuestionIndex);
            } else {
                console.log(`Game ${gameid} over`);
                clearGameTimer(gameid);
            }
        }
    }
}, 1000);

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

        // 2. Get the gameid and startTime from the request body
        const { gameid, startTime } = await req.json();
        console.log("gameid", gameid);
        console.log("userid", userid);
        console.log("startTime", startTime);

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

        setGameTimer(gameid, game.questions.length);

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
        const { data: questions, error: questionsError } = await supabase
            .from("questions")
            .select("a, b, c, d, question, id")
            .in("id", game.questions);

        if (questionsError || !questions) {
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

        // 7. Create an array of questions with ordered answers
        const orderedQuestions = questions.map(
            (
                question: {
                    a: string;
                    b: string;
                    c: string;
                    d: string;
                    question: string;
                    id: string;
                },
                index: number,
            ) => {
                const key = gameKeys.keys[index] || gameKeys.keys[0];
                return {
                    id: question.id,
                    question: question.question,
                    answers: {
                        a: question[key[0] as "a" | "b" | "c" | "d"],
                        b: question[key[1] as "a" | "b" | "c" | "d"],
                        c: question[key[2] as "a" | "b" | "c" | "d"],
                        d: question[key[3] as "a" | "b" | "c" | "d"],
                    },
                };
            },
        );
        // 8. Update the game record with the questions
        const { error: updateError } = await supabase
            .from("games")
            .update({
                metadata: {
                    questions: orderedQuestions,
                },
            })
            .eq("id", gameid);

        if (updateError) {
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

        return new Response(
            JSON.stringify({
                data: { questions: orderedQuestions },
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
