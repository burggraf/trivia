<script lang="ts">
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";

  async function handleLongProcess() {
    loadingState.show("Processing your request...");
    try {
      // Simulate long process
      await new Promise((resolve) => setTimeout(resolve, 4000));
    } finally {
      loadingState.hide();
    }
  }
</script>

<button
  class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
  onclick={handleLongProcess}
>
  Start Long Process
</button>
