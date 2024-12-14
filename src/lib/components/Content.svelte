<script lang="ts">
  import type { Snippet } from "svelte";
  let { Middle, MiddleData } = $props<{
    Middle?: Snippet;
    MiddleData?: any;
  }>();
</script>

<main class="flex-1 overflow-y-auto relative">
  <div
    class="container mx-auto relative px-4 min-h-full"
    style="padding-top: calc(var(--header-height) + var(--safe-area-inset-top, 0px)); padding-bottom: calc(var(--footer-height) + var(--safe-area-inset-bottom, 0px));"
  >
    <div
      class="fixed top-0 left-0 right-0 h-[var(--safe-area-inset-top,0px)] bg-background z-20"
    ></div>

    <div
      class="fixed bottom-0 left-0 right-0 h-[var(--safe-area-inset-bottom,0px)] bg-background z-20"
    ></div>

    <div class="relative py-6">
      {@render Middle(MiddleData)}
    </div>
  </div>
</main>

<style>
  main {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar) var(--scrollbar-bg);
  }

  main::-webkit-scrollbar {
    width: 8px;
  }

  main::-webkit-scrollbar-track {
    background: var(--scrollbar-bg);
  }

  main::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar);
    border-radius: 4px;
  }
</style>
