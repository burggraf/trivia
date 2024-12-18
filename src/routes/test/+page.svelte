<script lang="ts">
  import { createGame } from "$lib/services/gameService.svelte.ts";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Button } from "$lib/components/ui/button";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import { getUser, getCurrentGroup } from "$lib/services/backend.svelte";

  const user = $derived(getUser());
  const group = $derived(getCurrentGroup());

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
    Test Page
  {/snippet}
  {#snippet Middle()}
    <Button onclick={handleCreateGame}>Create New Game</Button>
    <br />
    <br />
  {/snippet}
</PageTemplate>
