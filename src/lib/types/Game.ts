export interface Game {
    created_at: string;
    groupid: string;
    id: string;
    metadata: {
        questions: {
            a: string;
            b: string;
            c: string;
            d: string;
            id: string;
            category: string;
            question: string;
            difficulty: string;
            correct_answer: string;
        }[];
        user_answers: {
            [questionId: string]: { [userId: string]: string };
        } | null;
    } | null;
    gamestate: string;
}
