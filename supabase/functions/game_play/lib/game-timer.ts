import { supabase } from "../../_shared/supabase_client.ts";

const gameTimers = new Map<
    string,
    {
        currentQuestionIndex: number;
        nextQuestionTime: number;
        questionInterval: number;
    }
>();
const QUESTION_INTERVAL = 10000; // 10 seconds

export function setGameTimer(gameid: string, numberOfQuestions: number) {
    if (!gameTimers.has(gameid)) {
        gameTimers.set(gameid, {
            currentQuestionIndex: 0,
            nextQuestionTime: Date.now() + QUESTION_INTERVAL,
            questionInterval: QUESTION_INTERVAL,
        });
    }
}

export function clearGameTimer(gameid: string) {
    gameTimers.delete(gameid);
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

                const currentQuestionId = game.questions[nextIndex];
                const { data: questionData, error: questionError } =
                    await supabase
                        .from("questions")
                        .select("a, b, c, d, question, id")
                        .eq("id", currentQuestionId)
                        .single();

                if (questionError || !questionData) {
                    console.error(
                        "Error fetching question data:",
                        questionError,
                    );
                    continue;
                }

                const { data: gameKeys, error: gameKeysError } = await supabase
                    .from("games_keys")
                    .select("keys")
                    .eq("id", gameid)
                    .single();

                if (gameKeysError || !gameKeys) {
                    console.log("Failed to get game keys record");
                    continue;
                }

                const key = gameKeys.keys[nextIndex] || gameKeys.keys[0];
                const answers = {
                    a: questionData[key[0] as "a" | "b" | "c" | "d"],
                    b: questionData[key[1] as "a" | "b" | "c" | "d"],
                    c: questionData[key[2] as "a" | "b" | "c" | "d"],
                    d: questionData[key[3] as "a" | "b" | "c" | "d"],
                };

                const channel = supabase.channel(gameid);
                channel.subscribe(
                    async (
                        status:
                            | "SUBSCRIBED"
                            | "CHANNEL_ERROR"
                            | "TIMED_OUT"
                            | "CLOSED",
                    ) => {
                        if (status === "SUBSCRIBED") {
                            channel.send({
                                type: "broadcast",
                                event: "new_question",
                                payload: {
                                    currentQuestionIndex:
                                        timer.currentQuestionIndex,
                                    question: questionData.question,
                                    answers,
                                },
                            });
                        }
                    },
                );
            } else {
                console.log(`Game ${gameid} over`);
                clearGameTimer(gameid);
            }
        }
    }
}, 1000);
