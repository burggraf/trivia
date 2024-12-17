<script lang="ts">
  import { createGame } from "$lib/services/gameService.svelte.ts";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    getUser,
    getCurrentGroup,
    initializeUser,
  } from "$lib/services/backend.svelte";
  import { onMount } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import type { Group } from "$lib/services/backend.svelte";

  let user = $state<User | null>(null);
  let group = $state<Group | null>(null);
  let loading = $state(true);

  onMount(async () => {
    await initializeUser();
    user = getUser();
    group = getCurrentGroup();
    loading = false;
  });

  const handleCreateGame = async () => {
    console.log("user", user);
    console.log("group", group);
    if (!group) {
      console.log("no current group");
      return;
    }
    const { data, error } = await createGame(group.id);
    console.log("data", data);
    console.log("error", error);
  };
  $effect(() => {
    console.log("user", user);
    console.log("group", group);
  });
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
