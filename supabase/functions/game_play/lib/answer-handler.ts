import { supabase } from "../../_shared/supabase_client.ts";

export async function handleAnswer(
    channel: any,
    gameid: string,
    userid: string,
) {
    channel.on(
        "broadcast",
        { event: "answer_submitted" },
        async (
            payload: {
                payload: {
                    gameid: string;
                    userid: string;
                    questionId: string;
                    answer: string;
                    currentQuestionIndex: number;
                };
            },
        ) => {
            console.log("Answer submitted:", payload);
            console.log("payload?.payload", payload?.payload);
            if (payload?.payload) {
                const { questionId, answer, currentQuestionIndex } =
                    payload.payload;

                const { data: questionData, error: questionError } =
                    await supabase
                        .from("questions")
                        .select("a, b, c, d, id")
                        .eq("id", questionId)
                        .single();

                if (questionError || !questionData) {
                    console.error(
                        "Error fetching question data:",
                        questionError,
                    );
                    return;
                }

                const { data: gameKeys, error: gameKeysError } = await supabase
                    .from("games_keys")
                    .select("keys")
                    .eq("id", gameid)
                    .single();

                if (gameKeysError || !gameKeys) {
                    console.log("Failed to get game keys record");
                    return;
                }
                const key = gameKeys.keys[currentQuestionIndex] ||
                    gameKeys.keys[0];
                const correctAnswer =
                    questionData[key[0] as "a" | "b" | "c" | "d"];

                const isCorrect = answer === correctAnswer;

                const { error: insertError } = await supabase
                    .from("games_answers")
                    .insert({
                        gameid,
                        questionid: questionId,
                        answer,
                        userid,
                    });

                if (insertError) {
                    console.error("Error inserting answer:", insertError);
                    return;
                }

                channel.send({
                    type: "broadcast",
                    event: "answer_result",
                    payload: {
                        correctAnswer,
                        isCorrect,
                        questionId,
                    },
                });
            }
        },
    );
}
