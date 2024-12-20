<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import type { Json } from "$lib/types/database.types";
  import { fetchGame } from "$lib/services/gameService.svelte";
  import { saveAnswer } from "$lib/services/gameService.svelte";
  import { Button } from "$lib/components/ui/button";

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

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
        },
        (payload) => {
          if (payload.new) {
            game = payload.new as Game;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });
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
