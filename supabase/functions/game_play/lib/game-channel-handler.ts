import { supabase } from "../../_shared/supabase_client.ts";
import { broadcastQuestion } from "./game-broadcast.ts";

export const setupGameChannel = async (
    channel: any,
    gameid: string,
    userid: string,
    questions: any[],
    game: any,
) => {
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
                    users[userid] = { user: { id: userid }, answers: [] };
                } else {
                    users[userid] = {
                        user: { id: userid, ...profile },
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
            const allUsersAnswered = Object.keys(users).every(
                (userId) =>
                    users[userId].answers.some(
                        (answer) =>
                            answer.questionIndex === currentQuestionIndex,
                    ),
            );

            if (allUsersAnswered) {
                currentQuestionIndex++;
                broadcastQuestion(
                    channel,
                    questions[currentQuestionIndex],
                    currentQuestionIndex,
                );
            } else {
                currentQuestionIndex++;
                await new Promise((resolve) => setTimeout(resolve, 10000));
                broadcastQuestion(
                    channel,
                    questions[currentQuestionIndex],
                    currentQuestionIndex,
                );
            }
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

    setTimeout(broadcastNextQuestion, 10000);
};
