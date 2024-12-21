<script lang="ts">
  import type { Question } from "$lib/types/Question";

  let { question, selectedAnswer, correctAnswer, saveAnswer } = $props<{
    question: Question;
    selectedAnswer: string | null;
    correctAnswer: string | null;
    saveAnswer: (answer: string) => Promise<void>;
  }>();
</script>

<div>
  <p>Question: {question.question}</p>
  <p>Answers:</p>
  <ul>
    <li>
      <button
        class:bg-green-500={selectedAnswer === "a"}
        class:bg-red-500={correctAnswer === "a" && selectedAnswer !== "a"}
        onclick={() => saveAnswer("a")}
      >
        A: {question.a}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={selectedAnswer === "b"}
        class:bg-red-500={correctAnswer === "b" && selectedAnswer !== "b"}
        onclick={() => saveAnswer("b")}
      >
        B: {question.b}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={selectedAnswer === "c"}
        class:bg-red-500={correctAnswer === "c" && selectedAnswer !== "c"}
        onclick={() => saveAnswer("c")}
      >
        C: {question.c}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={selectedAnswer === "d"}
        class:bg-red-500={correctAnswer === "d" && selectedAnswer !== "d"}
        onclick={() => saveAnswer("d")}
      >
        D: {question.d}
      </button>
    </li>
  </ul>
</div>
