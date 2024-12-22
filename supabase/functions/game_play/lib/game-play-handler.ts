import { corsHeaders } from "../../_shared/cors.ts";
import { getUser } from "../../_shared/get_user.ts";
import { supabase } from "../../_shared/supabase_client.ts";

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
    const { data: game, error: gameError } = await supabase
        .from("games")
        .select("metadata")
        .eq("id", gameid)
        .single();

    if (gameError || !game) {
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
    const questions = game.metadata?.questions;
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
    let currentQuestionIndex = 0;
    const users: {
        [userId: string]: {
            user: any;
            answers: {
                questionIndex: number;
                answer: string;
                isCorrect: boolean;
            }[];
        };
    } = {};
    const userAnswers: { [questionId: string]: { [userId: string]: string } } =
        {};

    channel.subscribe(
        async (
            status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED",
        ) => {
            if (status === "SUBSCRIBED") {
                // Initialize user in users object
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("firstname, lastname")
                    .eq("id", userid)
                    .single();

                if (profileError) {
                    console.error("Error fetching profile:", profileError);
                    users[userid] = { user, answers: [] };
                } else {
                    users[userid] = {
                        user: { ...user, ...profile },
                        answers: [],
                    };
                }

                // Broadcast the first question
                broadcastQuestion(
                    channel,
                    questions[currentQuestionIndex],
                    currentQuestionIndex,
                );
            }
        },
    );

    channel.on(
        "broadcast",
        { event: "answer_submitted" },
        async (
            payload: { payload: { questionId: string; answer: string } },
        ) => {
            if (payload?.payload) {
                const { questionId, answer } = payload.payload;
                console.log("answer_submitted", payload.payload);

                // Create a games_answers record
                const { error: insertError } = await supabase
                    .from("games_answers")
                    .insert({
                        gameid,
                        userid,
                        questionid: questionId,
                        answer,
                        correct:
                            questions[currentQuestionIndex].correct_answer ===
                                    answer
                                ? 1
                                : 0,
                    });

                if (insertError) {
                    console.error("Error inserting answer:", insertError);
                    return;
                }

                // Track user answers
                if (!userAnswers[questionId]) {
                    userAnswers[questionId] = {};
                }
                const isCorrect =
                    questions[currentQuestionIndex].correct_answer === answer;

                // Update user's answers
                users[userid].answers.push({
                    questionIndex: currentQuestionIndex,
                    answer,
                    isCorrect,
                });

                userAnswers[questionId][userid] = answer;

                // Broadcast the users object
                channel.send({
                    type: "broadcast",
                    event: "users_update",
                    payload: { users },
                });

                channel.send({
                    type: "broadcast",
                    event: "answer_result",
                    payload: {
                        correctAnswer:
                            questions[currentQuestionIndex].correct_answer,
                        isCorrect:
                            questions[currentQuestionIndex].correct_answer ===
                                answer,
                    },
                });
            }
        },
    );

    const broadcastNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            await new Promise((resolve) => setTimeout(resolve, 10000));
            broadcastQuestion(
                channel,
                questions[currentQuestionIndex],
                currentQuestionIndex,
            );
        } else {
            // Game over
            await new Promise((resolve) => setTimeout(resolve, 10000));
            const { error: updateError } = await supabase
                .from("games")
                .update({
                    metadata: { ...game.metadata, user_answers: userAnswers },
                })
                .eq("id", gameid);

            if (updateError) {
                console.error("Error updating game metadata:", updateError);
                return;
            }

            channel.send({
                type: "broadcast",
                event: "game_over",
                payload: { message: "Game over!" },
            });
            channel.unsubscribe();
        }
    };

    const broadcastQuestion = (
        channel: any,
        question: any,
        currentQuestionIndex: number,
    ) => {
        channel.send({
            type: "broadcast",
            event: "new_question",
            payload: {
                question: question.question,
                id: question.id,
                category: question.category,
                difficulty: question.difficulty,
                a: question.a,
                b: question.b,
                c: question.c,
                d: question.d,
                currentQuestionIndex,
            },
        });
        setTimeout(broadcastNextQuestion, 10000);
    };
}
