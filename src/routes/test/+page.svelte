<script lang="ts">
  import { createGame } from "$lib/services/gameService.svelte.ts";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Button } from "$lib/components/ui/button";
  import { getUser, getCurrentGroup } from "$lib/services/backend.svelte";

  const user = $derived(getUser());

  const group = $derived(getCurrentGroup());
  let loading = $state(false);

  const handleCreateGame = async () => {
    if (!group) {
      console.log("no current group");
      return;
    }
    loading = true;
    const { data, error } = await createGame(group.id);
    console.log("data", data);
    console.log("error", error);
    loading = false;
  };
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Test Page
  {/snippet}
  {#snippet Middle()}
    {#if loading}
      Loading...
    {:else}
      <Button onclick={handleCreateGame}>Create New Game</Button>
      <br />
      <br />
      Welcome: {user?.email}
    {/if}
  {/snippet}
</PageTemplate>
