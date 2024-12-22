<script lang="ts">
  import type { Question } from "$lib/types/Question";
  import * as Card from "$lib/components/ui/card";

  let {
    question,
    selectedAnswer,
    correctAnswer,
    saveAnswer,
    isCorrect,
    currentQuestionIndex,
  } = $props<{
    question: Question;
    selectedAnswer: string | null;
    correctAnswer: string | null;
    isCorrect: boolean | null;
    saveAnswer: (answer: string) => Promise<void>;
    currentQuestionIndex: number;
  }>();

  console.log("selectedAnswer in Question component:", selectedAnswer);
  let localSelectedAnswer = $derived(selectedAnswer);
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title>Question {currentQuestionIndex + 1}</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>{question.question}</p>
    <div class="mt-4 grid gap-4">
      <div
        class={`whitespace-normal min-h-[4rem] rounded-md p-4 ${
          isCorrect === true && localSelectedAnswer === "a"
            ? "border-green-500 border-2"
            : isCorrect === false &&
                localSelectedAnswer === "a" &&
                localSelectedAnswer !== correctAnswer
              ? "border-red-500 border-2"
              : isCorrect === false && correctAnswer === "a"
                ? "border-black border-2"
                : "border-2"
        }`}
        role="button"
        tabindex="0"
        onclick={() => saveAnswer("a")}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") saveAnswer("a");
        }}
      >
        A: {question.a}
      </div>
      <div
        class={`whitespace-normal min-h-[4rem] rounded-md p-4 ${
          isCorrect === true && localSelectedAnswer === "b"
            ? "border-green-500 border-2"
            : isCorrect === false &&
                localSelectedAnswer === "b" &&
                localSelectedAnswer !== correctAnswer
              ? "border-red-500 border-2"
              : isCorrect === false && correctAnswer === "b"
                ? "border-black border-2"
                : "border-2"
        }`}
        role="button"
        tabindex="0"
        onclick={() => saveAnswer("b")}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") saveAnswer("b");
        }}
      >
        B: {question.b}
      </div>
      <div
        class={`whitespace-normal min-h-[4rem] rounded-md p-4 ${
          isCorrect === true && localSelectedAnswer === "c"
            ? "border-green-500 border-2"
            : isCorrect === false &&
                localSelectedAnswer === "c" &&
                localSelectedAnswer !== correctAnswer
              ? "border-red-500 border-2"
              : isCorrect === false && correctAnswer === "c"
                ? "border-black border-2"
                : "border-2"
        }`}
        role="button"
        tabindex="0"
        onclick={() => saveAnswer("c")}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") saveAnswer("c");
        }}
      >
        C: {question.c}
      </div>
      <div
        class={`whitespace-normal min-h-[4rem] rounded-md p-4 ${
          isCorrect === true && localSelectedAnswer === "d"
            ? "border-green-500 border-2"
            : isCorrect === false &&
                localSelectedAnswer === "d" &&
                localSelectedAnswer !== correctAnswer
              ? "border-red-500 border-2"
              : isCorrect === false && correctAnswer === "d"
                ? "border-black border-2"
                : "border-2"
        }`}
        role="button"
        tabindex="0"
        onclick={() => saveAnswer("d")}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") saveAnswer("d");
        }}
      >
        D: {question.d}
      </div>
    </div>
  </Card.Content>
</Card.Root>
