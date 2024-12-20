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
    metadata: Json | null;
    questions: string[];
    gamestate: string;
  }

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);

  $effect(() => {
    fetchGame(gameId).then((data) => {
      game = data;
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
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
