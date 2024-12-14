<script lang="ts">
  import { loadingState } from "./loading-state.svelte.ts";
  import { Loader2 } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import { cn } from "$lib/utils";
</script>

{#if loadingState.isOpen}
  <div
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    transition:fade={{ duration: 150 }}
  >
    <div
      class="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
    >
      <div class="flex flex-col items-center gap-2">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
        <p class="text-sm text-muted-foreground">
          {loadingState.message}
        </p>
      </div>
    </div>
  </div>
{/if}
