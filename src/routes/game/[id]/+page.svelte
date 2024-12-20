<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";

  const gameId = $page.params.id;
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Game
  {/snippet}
  {#snippet Middle()}
    <h1>Game ID: {gameId}</h1>
  {/snippet}
</PageTemplate>
