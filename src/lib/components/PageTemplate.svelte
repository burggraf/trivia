<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import LeftDrawer from "$lib/components/LeftDrawer.svelte";
  import StatusBar from "$lib/components/StatusBar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Content from "$lib/components/Content.svelte";
  import { MoreVertical } from "lucide-svelte";
  import Actions from "$lib/components/actions.svelte";
  import type { Snippet } from "svelte";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";
  import MessageIndicator from "$lib/components/MessageIndicator.svelte";

  let {
    actionItems,
    TopLeft,
    TopCenter,
    TopRight,
    Middle,
    BottomLeft,
    BottomCenter,
    BottomRight,
  } = $props<{
    actionItems?: any[];
    TopLeft?: (data: any) => unknown;
    TopCenter?: (data: any) => unknown;
    TopRight?: (data: any) => unknown;
    Middle?: (data: any) => unknown;
    BottomLeft?: Snippet | undefined; // (data: any) => unknown;
    BottomCenter?: (data: any) => unknown;
    BottomRight?: (data: any) => unknown;
  }>();
</script>

<Sidebar.Provider>
  <div class="flex min-h-screen w-full">
    <LeftDrawer />

    <main class="flex-1 relative flex flex-col h-[100dvh]">
      <div class="flex flex-col h-full">
        <Navbar>
          {#snippet Left()}
            <Sidebar.Trigger />
            {@render TopLeft?.()}
          {/snippet}
          {#snippet Center()}
            {@render TopCenter?.()}
          {/snippet}
          {#snippet Right()}
            {#if TopRight}
              {@render TopRight?.()}
            {:else if actionItems}
              <Actions items={actionItems} triggerIcon={MoreVertical} />
            {/if}
          {/snippet}
        </Navbar>

        <Content>
          {#snippet Middle()}
            {@render Middle?.()}
          {/snippet}
        </Content>

        <StatusBar>
          {#snippet Left()}
            {#if BottomLeft}
              {@render BottomLeft()}
            {:else}
              <LanguageSelector />
              <DarkModeToggle />
            {/if}
          {/snippet}
          {#snippet Center()}
            {#if BottomCenter}
              {@render BottomCenter()}
            {:else}
              {__APP_TITLE__} v{__APP_VERSION__}
            {/if}
          {/snippet}
          {#snippet Right()}
            {#if BottomRight}
              {@render BottomRight()}
            {:else}
              <MessageIndicator />
            {/if}
          {/snippet}
        </StatusBar>
      </div>
    </main>
  </div>
</Sidebar.Provider>
