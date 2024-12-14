<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import { Button } from "$lib/components/ui/button";

  async function handleLongProcess() {
    loadingState.show("Processing your request...");
    try {
      // Simulate long process
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      loadingState.hide();
    }
  }
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  <!--{#snippet TopLeft()}{/snippet}-->
  {#snippet TopCenter()}
    Loading Sample
  {/snippet}
  <!--{#snippet TopRight()}{/snippet}-->

  {#snippet Middle()}
    <Button
      class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      onclick={handleLongProcess}
    >
      Start Long Process
    </Button>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
