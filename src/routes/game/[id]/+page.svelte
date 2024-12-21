<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import type { Json } from "$lib/types/database.types";
  import { fetchGame } from "$lib/services/gameService.svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { getUser } from "$lib/services/backend.svelte";
  import { saveAnswer as saveAnswerService } from "$lib/services/gameService.svelte";
  const user = $derived(getUser());

  interface Game {
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

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);
  let currentQuestion = $state<{
    a: string;
    b: string;
    c: string;
    d: string;
    id: string;
    category: string;
    question: string;
    difficulty: string;
    correct_answer: string;
  } | null>(null);
  let selectedAnswer = $state<string | null>(null);
  let correctAnswer = $state<string | null>(null);
  let currentQuestionIndex = $state<number>(0);

  $effect(() => {
    fetchGame(gameId)
      .then((data) => {
        game = data;
      })
      .then(async () => {
        await supabase.functions.invoke("game_play", {
          body: { gameid: gameId },
        });
      });

    const channel = supabase.channel(gameId);
    channel
      .on("broadcast", { event: "new_question" }, (payload) => {
        if (payload.payload) {
          currentQuestion = {
            a: payload.payload.a,
            b: payload.payload.b,
            c: payload.payload.c,
            d: payload.payload.d,
            id: payload.payload.id,
            category: payload.payload.category,
            question: payload.payload.question,
            difficulty: payload.payload.difficulty,
            correct_answer: "",
          };
          currentQuestionIndex = payload.payload.currentQuestionIndex;
          selectedAnswer = null;
          correctAnswer = null;
        }
      })
      .on("broadcast", { event: "answer_result" }, (payload) => {
        if (payload.payload) {
          correctAnswer = payload.payload.correctAnswer;
          if (payload.payload.isCorrect) {
            selectedAnswer = correctAnswer;
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  async function saveAnswer(answer: string) {
    if (!currentQuestion) return;
    await saveAnswerService(
      gameId,
      currentQuestion.id,
      answer,
      currentQuestionIndex,
    );
  }
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Game
  {/snippet}
  {#snippet Middle()}
    {#if game}
      <h1>Game ID: {game.id}</h1>
      <p>Created At: {new Date(game.created_at).toLocaleString()}</p>
      <p>Status: {game.gamestate}</p>
      {#if currentQuestion}
        <p>Question: {currentQuestion.question}</p>
        <p>Answers:</p>
        <ul>
          <li>
            <Button
              class={cn(
                selectedAnswer === "a" ? "bg-green-500" : "",
                correctAnswer === "a" && selectedAnswer !== "a"
                  ? "bg-red-500"
                  : "",
              )}
              onclick={() => saveAnswer("a")}>A: {currentQuestion.a}</Button
            >
          </li>
          <li>
            <Button
              class={cn(
                selectedAnswer === "b" ? "bg-green-500" : "",
                correctAnswer === "b" && selectedAnswer !== "b"
                  ? "bg-red-500"
                  : "",
              )}
              onclick={() => saveAnswer("b")}>B: {currentQuestion.b}</Button
            >
          </li>
          <li>
            <Button
              class={cn(
                selectedAnswer === "c" ? "bg-green-500" : "",
                correctAnswer === "c" && selectedAnswer !== "c"
                  ? "bg-red-500"
                  : "",
              )}
              onclick={() => saveAnswer("c")}>C: {currentQuestion.c}</Button
            >
          </li>
          <li>
            <Button
              class={cn(
                selectedAnswer === "d" ? "bg-green-500" : "",
                correctAnswer === "d" && selectedAnswer !== "d"
                  ? "bg-red-500"
                  : "",
              )}
              onclick={() => saveAnswer("d")}>D: {currentQuestion.d}</Button
            >
          </li>
        </ul>
        <p>
          Current Question Index: {currentQuestionIndex + 1}
        </p>
      {/if}
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
