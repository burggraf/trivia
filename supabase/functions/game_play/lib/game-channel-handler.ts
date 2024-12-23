import { supabase } from "../../_shared/supabase_client.ts";
import { broadcastQuestion } from "./game-broadcast.ts";

export const setupGameChannel = async (game: any) => {
    let currentQuestionIndex = 0;
    const users: {
        [userId: string]: {
            user: any;
            answers: {
                questionIndex: number;
                answer: string;
                isCorrect: boolean;
            }[];
            active: boolean;
        };
    } = {};
    const userAnswers: { [questionId: string]: { [userId: string]: string } } =
        {};

    const handlePresence = async (presence: {
        joins?: { [key: string]: any }[] | null;
        leaves?: { [key: string]: any }[] | null;
    }) => {
        /**
         * presence.joins [
            [
                {
                "df3a3ae0-ee63-4679-902e-20c669688ce2:1734913133423": { online_at: "2024-12-23T00:18:53.397Z" },
                presence_ref: "GBOmTY3U0sCVTGbB"
                }
            ]
        ]

           */
        let hasChanges = false;

        if (presence.joins) {
            for (const joinsArray of presence.joins) {
                const key = Object.keys(joinsArray[0])[0];
                const userId = key ? key.split(":")[0] : key;
                if (!users[userId]) {
                    const { data: profile, error: profileError } =
                        await supabase
                            .from("profiles")
                            .select("firstname, lastname")
                            .eq("id", userId)
                            .single();

                    if (profileError) {
                        console.error(
                            "Error fetching profile:",
                            profileError,
                        );
                        users[userId] = {
                            user: { id: userId },
                            answers: [],
                            active: true,
                        };
                    } else {
                        users[userId] = {
                            user: { id: userId, ...profile },
                            answers: [],
                            active: true,
                        };
                    }
                } else {
                    users[userId].active = true;
                }
            }
        }

        if (presence.leaves) {
            for (const leavesArray of presence.leaves) {
                const key = Object.keys(leavesArray)[0];
                const userId = key ? key.split(":")[0] : key;
                if (users[userId]) {
                    users[userId].active = false;
                }
            }
        }
        if (hasChanges) {
            // Broadcast the users object
        }

        game.channel.send({
            type: "broadcast",
            event: "current_status",
            payload: {
                users,
                question: game.questions[currentQuestionIndex],
                currentQuestionIndex,
            },
        });
    };
    game.channel.subscribe(
        async (
            status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED",
        ) => {
            if (status === "SUBSCRIBED") {
                // Broadcast the first question
                broadcastQuestion(
                    game.channel,
                    game.questions[currentQuestionIndex],
                    currentQuestionIndex,
                );
                startQuestionTimer(currentQuestionIndex);
            }
        },
    );

    game.channel
        .on("presence", { event: "sync" }, () => {
            const newState = game.channel.presenceState();
        })
        .on(
            "presence",
            { event: "join" },
            (
                { key, newPresences }: {
                    key: string;
                    newPresences: { [key: string]: any };
                },
            ) => {
                handlePresence({ joins: [newPresences], leaves: undefined });
            },
        )
        .on(
            "presence",
            { event: "leave" },
            (
                { key, leftPresences }: {
                    key: string;
                    leftPresences: { [key: string]: any };
                },
            ) => {
                handlePresence({ joins: undefined, leaves: [leftPresences] });
            },
        );

    game.channel.on(
        "broadcast",
        { event: "answer_submitted" },
        async (
            payload: {
                payload: { questionId: string; answer: string; userid: string };
            },
        ) => {
            if (payload?.payload) {
                const { questionId, answer, userid } = payload.payload;

                // Create a games_answers record
                const { error: insertError } = await supabase
                    .from("games_answers")
                    .insert({
                        gameid: game.id,
                        userid,
                        questionid: questionId,
                        answer,
                        correct: game.questions[currentQuestionIndex]
                                .correct_answer ===
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
                    game.questions[currentQuestionIndex].correct_answer ===
                        answer;
                // Update user's answers
                if (!users[userid].answers) {
                    users[userid].answers = [];
                }
                users[userid].answers.push({
                    questionIndex: currentQuestionIndex,
                    answer,
                    isCorrect,
                });

                userAnswers[questionId][userid] = answer;

                // Broadcast the users object
                sendCurrentStatus();

                game.channel.send({
                    type: "broadcast",
                    event: "answer_result",
                    payload: {
                        correctAnswer:
                            game.questions[currentQuestionIndex].correct_answer,
                        isCorrect: game.questions[currentQuestionIndex]
                            .correct_answer ===
                            answer,
                    },
                });
            }
        },
    );
    game.channel.on("broadcast", { event: "get_status" }, () => {
        sendCurrentStatus();
    });

    const sendCurrentStatus = () => {
        game.channel.send({
            type: "broadcast",
            event: "current_status",
            payload: {
                users,
                question: game.questions[currentQuestionIndex],
                currentQuestionIndex,
            },
        });
    };

    const startQuestionTimer = (currentQuestionIndex: number) => {
        let timerId: number | null = null;
        const questionTimeout = 30000;
        const delayBeforeNextQuestion = 5000;

        timerId = setTimeout(async () => {
            timerId = null;
            // Broadcast the correct answer
            game.channel.send({
                type: "broadcast",
                event: "answer_result",
                payload: {
                    correctAnswer:
                        game.questions[currentQuestionIndex].correct_answer,
                    isCorrect: false,
                },
            });

            await new Promise((resolve) =>
                setTimeout(resolve, delayBeforeNextQuestion)
            );
            await broadcastNextQuestion();
        }, questionTimeout);

        const checkAllUsersAnswered = async () => {
            const idx = currentQuestionIndex - 1;

            const allUsersAnswered = Object.values(users).every(
                (user) => {
                    if (!user.active) {
                        return true;
                    }
                    // search the answers array for the current question index
                    const found = user.answers.some(
                        (answer) => answer.questionIndex === idx,
                    );
                    return found;
                },
            );

            if (allUsersAnswered) {
                if (timerId) {
                    clearTimeout(timerId);
                    timerId = null;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, delayBeforeNextQuestion)
                );
                await broadcastNextQuestion();
            } else {
                // Check again after a short delay
                setTimeout(checkAllUsersAnswered, 1000);
            }
        };
        checkAllUsersAnswered();
    };

    const broadcastNextQuestion = async () => {
        if (currentQuestionIndex < game.questions.length - 1) {
            currentQuestionIndex++;
            broadcastQuestion(
                game.channel,
                game.questions[currentQuestionIndex],
                currentQuestionIndex,
            );
            startQuestionTimer(currentQuestionIndex);
        } else {
            // Game over
            await new Promise((resolve) => setTimeout(resolve, 10000));
            const { error: updateError } = await supabase
                .from("games")
                .update({
                    metadata: { ...game.metadata, user_answers: userAnswers },
                })
                .eq("id", game.id);

            if (updateError) {
                console.error("Error updating game metadata:", updateError);
                return;
            }

            game.channel.send({
                type: "broadcast",
                event: "game_over",
                payload: { message: "Game over!" },
            });
            game.channel.unsubscribe();
        }
    };
    console.log("Game channel setup complete, calling sendCurrentStatus()");
    sendCurrentStatus();
};
