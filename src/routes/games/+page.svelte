<script lang="ts">
  import {
    createGame,
    getOpenGamesForGroup,
  } from "$lib/services/gameService.svelte";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Button } from "$lib/components/ui/button";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import { getUser, getCurrentGroup } from "$lib/services/backend.svelte";
  import type { Json } from "$lib/types/database.types";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/services/supabase";

  interface Game {
    created_at: string;
    groupid: string;
    id: string;
    metadata: Json | null;
    questions: string[];
    gamestate: string;
  }

  const user = $derived(getUser());
  const group = $derived(getCurrentGroup());

  let openGames = $state<Game[]>([]);

  $effect(() => {
    if (!group) return;

    getOpenGamesForGroup(group.id)
      .then((response) => {
        if (response?.data) {
          openGames = response.data;
        } else {
          console.error("Error fetching open games:", response?.error);
        }
      })
      .then(() => {
        const channel = supabase
          .channel("games")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "games",
            },
            (payload) => {
              if (
                payload.eventType === "INSERT" ||
                payload.eventType === "UPDATE"
              ) {
                if (payload.new) {
                  openGames = [...openGames, payload.new as Game];
                }
              } else if (payload.eventType === "DELETE") {
                openGames = openGames.filter(
                  (game) => game.id !== payload.old.id,
                );
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      });
  });

  const handleCreateGame = async () => {
    if (!group) {
      console.log("no current group");
      return;
    }
    loadingState.show("Creating game...");
    try {
      const { data, error } = await createGame(group.id);
      console.log("data", data);
      console.log("error", error);
    } finally {
      loadingState.hide();
    }
  };
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Games
  {/snippet}
  {#snippet Middle()}
    <Button onclick={handleCreateGame}>Create New Game</Button>
    <br />
    <br />
    {#if openGames.length > 0}
      <h2>Open Games</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each openGames as game}
            <TableRow onclick={() => goto(`/game/${game.id}`)}>
              <TableCell>
                {new Date(game.created_at).toLocaleDateString()}
                {new Date(game.created_at).toLocaleTimeString()}
              </TableCell>
              <TableCell>{game.gamestate}</TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    {:else}
      <p>No open games.</p>
    {/if}
  {/snippet}
</PageTemplate>
