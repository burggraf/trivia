<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import type { Json } from "$lib/types/database.types";
  import { fetchGame } from "$lib/services/gameService.svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { getUser } from "$lib/services/backend.svelte";
  const user = $derived(getUser());

  interface Game {
    created_at: string;
    groupid: string;
    id: string;
    metadata: {
      question: string;
      answers: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
      currentQuestionIndex: number;
    } | null;
    questions: string[];
    gamestate: string;
  }

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);
  let questions = $state<
    {
      id: string;
      question: string;
      answers: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
    }[]
  >([]);
  let selectedAnswer = $state<string | null>(null);
  let correctAnswer = $state<string | null>(null);

  $effect(() => {
    fetchGame(gameId)
      .then((data) => {
        game = data;
      })
      .then(async () => {
        const response = await supabase.functions.invoke("game_play", {
          body: { gameid: gameId, startTime: Date.now() },
        });
        if (response.data) {
          const { data } = response.data;
          if (data?.questions) {
            questions = data.questions;
          }
        }
      });

    const channel = supabase.channel(gameId);
    channel
      .on("broadcast", { event: "new_question" }, (payload) => {
        if (payload.payload) {
          game = {
            ...game,
            metadata: {
              ...game?.metadata,
              question: payload.payload.question,
              answers: payload.payload.answers,
              currentQuestionIndex: payload.payload.currentQuestionIndex,
            },
          } as Game;
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

  async function saveAnswer(
    gameId: string,
    questionId: string,
    answer: string,
    currentQuestionIndex: number,
  ) {
    const channel = supabase.channel(gameId);
    console.log("saveAnswer", gameId, questionId, answer, currentQuestionIndex);
    channel.send({
      type: "broadcast",
      event: "answer_submitted",
      payload: {
        userid: user?.id,
        questionId,
        answer,
        gameId,
        currentQuestionIndex,
      },
    });
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
      {#if game?.metadata?.question}
        <p>Question: {game.metadata.question}</p>
        <p>Answers:</p>
        {#if game.metadata.answers}
          <ul>
            <li>
              <Button
                class={cn(
                  selectedAnswer === game.metadata.answers.a
                    ? "bg-green-500"
                    : "",
                  correctAnswer === game.metadata.answers.a &&
                    selectedAnswer !== game.metadata.answers.a
                    ? "bg-red-500"
                    : "",
                )}
                onclick={() =>
                  game &&
                  game.metadata &&
                  questions[game.metadata.currentQuestionIndex] &&
                  saveAnswer(
                    game.id,
                    questions[game.metadata.currentQuestionIndex].id,
                    "a",
                    game.metadata.currentQuestionIndex,
                  )}>A: {game?.metadata?.answers?.a}</Button
              >
            </li>
            <li>
              <Button
                class={cn(
                  selectedAnswer === game.metadata.answers.b
                    ? "bg-green-500"
                    : "",
                  correctAnswer === game.metadata.answers.b &&
                    selectedAnswer !== game.metadata.answers.b
                    ? "bg-red-500"
                    : "",
                )}
                onclick={() =>
                  game &&
                  game.metadata &&
                  questions[game.metadata.currentQuestionIndex] &&
                  saveAnswer(
                    game.id,
                    questions[game.metadata.currentQuestionIndex].id,
                    "b",
                    game.metadata.currentQuestionIndex,
                  )}>B: {game?.metadata?.answers?.b}</Button
              >
            </li>
            <li>
              <Button
                class={cn(
                  selectedAnswer === game.metadata.answers.c
                    ? "bg-green-500"
                    : "",
                  correctAnswer === game.metadata.answers.c &&
                    selectedAnswer !== game.metadata.answers.c
                    ? "bg-red-500"
                    : "",
                )}
                onclick={() =>
                  game &&
                  game.metadata &&
                  questions[game.metadata.currentQuestionIndex] &&
                  saveAnswer(
                    game.id,
                    questions[game.metadata.currentQuestionIndex].id,
                    "c",
                    game.metadata.currentQuestionIndex,
                  )}>C: {game?.metadata?.answers?.c}</Button
              >
            </li>
            <li>
              <Button
                class={cn(
                  selectedAnswer === game.metadata.answers.d
                    ? "bg-green-500"
                    : "",
                  correctAnswer === game.metadata.answers.d &&
                    selectedAnswer !== game.metadata.answers.d
                    ? "bg-red-500"
                    : "",
                )}
                onclick={() =>
                  game &&
                  game.metadata &&
                  questions[game.metadata.currentQuestionIndex] &&
                  saveAnswer(
                    game.id,
                    questions[game.metadata.currentQuestionIndex].id,
                    "d",
                    game.metadata.currentQuestionIndex,
                  )}>D: {game?.metadata?.answers?.d}</Button
              >
            </li>
          </ul>
        {/if}
        <p>
          Current Question Index: {game?.metadata?.currentQuestionIndex + 1}
        </p>
      {/if}
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
