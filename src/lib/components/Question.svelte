<script lang="ts">
  import type { Question } from "$lib/types/Question";

  let { question, selectedAnswer, correctAnswer, saveAnswer, isCorrect } =
    $props<{
      question: Question;
      selectedAnswer: string | null;
      correctAnswer: string | null;
      isCorrect: boolean | null;
      saveAnswer: (answer: string) => Promise<void>;
    }>();

  console.log("selectedAnswer in Question component:", selectedAnswer);
  let localSelectedAnswer = $derived(selectedAnswer);
</script>

<div>
  <p>Question: {question.question}</p>
  <p>Answers:</p>
  <ul>
    <li>
      <button
        class:bg-green-500={isCorrect === true && localSelectedAnswer === "a"}
        class:bg-red-500={isCorrect === false &&
          localSelectedAnswer === "a" &&
          localSelectedAnswer !== correctAnswer}
        class:bg-gray-200={isCorrect === false && correctAnswer === "a"}
        onclick={() => saveAnswer("a")}
      >
        A: {question.a}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={isCorrect === true && localSelectedAnswer === "b"}
        class:bg-red-500={isCorrect === false &&
          localSelectedAnswer === "b" &&
          localSelectedAnswer !== correctAnswer}
        class:bg-gray-200={isCorrect === false && correctAnswer === "b"}
        onclick={() => saveAnswer("b")}
      >
        B: {question.b}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={isCorrect === true && localSelectedAnswer === "c"}
        class:bg-red-500={isCorrect === false &&
          localSelectedAnswer === "c" &&
          localSelectedAnswer !== correctAnswer}
        class:bg-gray-200={isCorrect === false && correctAnswer === "c"}
        onclick={() => saveAnswer("c")}
      >
        C: {question.c}
      </button>
    </li>
    <li>
      <button
        class:bg-green-500={isCorrect === true && localSelectedAnswer === "d"}
        class:bg-red-500={isCorrect === false &&
          localSelectedAnswer === "d" &&
          localSelectedAnswer !== correctAnswer}
        class:bg-gray-200={isCorrect === false && correctAnswer === "d"}
        onclick={() => saveAnswer("d")}
      >
        D: {question.d}
      </button>
    </li>
  </ul>
</div>
isCorrect: {isCorrect}<br />
selectedAnswer: {selectedAnswer}<br />
