// import { supabase } from "../../_shared/supabase_client.ts";

export const broadcastQuestion = (
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
};
