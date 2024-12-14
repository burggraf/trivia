<script lang="ts">
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";

  let {
    Left,
    Center,
    Right,
    FullStatusBar,
    LeftData,
    CenterData,
    RightData,
    FullStatusBarData,
  } = $props<{
    Left?: (data: any) => unknown | undefined;
    Center?: (data: any) => unknown | undefined;
    Right?: (data: any) => unknown | undefined;
    FullStatusBar?: (data: any) => unknown | undefined;
    LeftData?: any;
    CenterData?: any;
    RightData?: any;
    FullStatusBarData?: any;
  }>();
</script>

<footer
  class="bg-background footer-height border-t flex items-center justify-between px-4 sticky bottom-0 left-0 right-0 z-30"
  style="margin-bottom: var(--safe-area-inset-bottom, 0px)"
>
  {#if FullStatusBar}
    <div class="flex items-center justify-center w-full">
      {@render FullStatusBar?.(FullStatusBarData)}
    </div>
  {:else}
    <div class="flex items-center space-x-2">
      {@render Left?.(LeftData)}
    </div>

    <div>
      {@render Center?.(CenterData)}
    </div>

    <div class="flex items-center space-x-2">
      {@render Right?.(RightData)}
    </div>
  {/if}
</footer>
<Toaster richColors />
