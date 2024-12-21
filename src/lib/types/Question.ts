export interface Question {
    a: string;
    b: string;
    c: string;
    d: string;
    id: string;
    category: string;
    question: string;
    difficulty: string;
    correct_answer: string;
}

export interface Answer {
    value: string;
    label: string;
}
