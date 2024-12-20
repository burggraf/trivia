<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import type { Json } from "$lib/types/database.types";
  import { fetchGame } from "$lib/services/gameService.svelte";

  interface Game {
    created_at: string;
    groupid: string;
    id: string;
    metadata: {
      question: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
      question_number: number;
      answers: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
    } | null;
    questions: string[];
    gamestate: string;
  }

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);

  $effect(() => {
    fetchGame(gameId)
      .then((data) => {
        game = data;
      })
      .then(() => {
        supabase.functions.invoke("game_play", {
          body: { gameid: gameId },
        });
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
      <p>Question: {game.metadata?.question}</p>
      <p>Question Number: {game.metadata?.question_number}</p>
      {#if game?.metadata?.answers}
        <p>Answers:</p>
        <ul>
          <li>A: {game.metadata.answers.a}</li>
          <li>B: {game.metadata.answers.b}</li>
          <li>C: {game.metadata.answers.c}</li>
          <li>D: {game.metadata.answers.d}</li>
        </ul>
      {/if}
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
