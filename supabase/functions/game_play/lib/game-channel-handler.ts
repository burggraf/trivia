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
        console.log("handlePresence", presence);
        let hasChanges = false;

        if (presence.joins) {
            console.log("presence.joins", presence.joins);
            for (const joinsArray of presence.joins) {
                const key = Object.keys(joinsArray[0])[0];
                console.log("**** key is: ", key);
                console.log("presence.joins key", key);
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
            console.log("presence.leaves", presence.leaves);
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
            console.log("sync", newState);
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
                console.log("join", key, newPresences);
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
                console.log("leave", key, leftPresences);
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
            console.log("answer_submitted", payload);
            if (payload?.payload) {
                const { questionId, answer, userid } = payload.payload;
                console.log("answer_submitted questionId", questionId);
                console.log("answer_submitted answer", answer);
                console.log("answer_submitted userid", userid);

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
                console.log("track user answers");
                if (!userAnswers[questionId]) {
                    console.log("*** create userAnswers[questionId]");
                    userAnswers[questionId] = {};
                    console.log("done");
                } else {
                    console.log("*** userAnswers[questionId] exists");
                }
                const isCorrect =
                    game.questions[currentQuestionIndex].correct_answer ===
                        answer;
                console.log("isCorrect", isCorrect);
                // Update user's answers
                console.log("users", users);
                if (!users[userid].answers) {
                    console.log("*** create users[userid].answers");
                    users[userid].answers = [];
                } else {
                    console.log("*** users[userid].answers exists");
                }
                console.log("users[userid].answers.push", {
                    questionIndex: currentQuestionIndex,
                    answer,
                    isCorrect,
                });
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
        // console.log("got get_status event");
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
            console.log("Checking if all users have answered");
            console.log("users", users);
            const allUsersAnswered = Object.keys(users).every(
                (userId) =>
                    users[userId].answers.some(
                        (answer) =>
                            answer.questionIndex === currentQuestionIndex,
                    ),
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
