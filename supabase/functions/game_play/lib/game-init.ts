import { corsHeaders } from "../../_shared/cors.ts";
import { getUser } from "../../_shared/get_user.ts";
import { supabase } from "../../_shared/supabase_client.ts";
import { setGameTimer } from "./game-timer.ts";

export async function initializeGame(req: Request) {
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

    const firstQuestion = orderedQuestions[0];
    const channel = supabase.channel(gameid);
    channel.subscribe(
        async (
            status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED",
        ) => {
            if (status === "SUBSCRIBED") {
                channel.send({
                    type: "broadcast",
                    event: "new_question",
                    payload: {
                        currentQuestionIndex: 0,
                        question: firstQuestion.question,
                        answers: firstQuestion.answers,
                    },
                });
            }
        },
    );

    setGameTimer(gameid, game.questions.length);

    return { questions: orderedQuestions, channel, userid, gameid };
}
