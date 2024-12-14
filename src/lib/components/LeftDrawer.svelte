<script lang="ts">
  // import { Org } from "./../services/orgService.svelte.ts";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import SearchForm from "$lib/components/search-form.svelte";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import OrgSwitcher from "@/components/org-switcher.svelte";
  import {
    GalleryVerticalEnd,
    Minus,
    Plus,
    AudioWaveform,
    Command,
    Settings,
    BookOpen,
    Code,
    Box,
    SwatchBook,
    Sparkles,
    Mail,
    Users,
  } from "lucide-svelte";
  import NavUser from "$lib/components/nav-user.svelte";
  import type { ComponentProps } from "svelte";
  import { sidebarState } from "./LeftDrawer.svelte.ts";
  import { getUser } from "@/services/backend.svelte.ts";
  const user = $derived(getUser());

  let {
    ref = $bindable(null),
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();
  const data = {
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
      {
        title: "Messages",
        url: "#",
        icon: Mail,
        isActive: false,
        items: [
          {
            title: "Inbox",
            url: "/messages",
          },
        ],
      },
      {
        title: "People",
        url: "#",
        icon: Users,
        isActive: false,
        items: [
          {
            title: "Contacts",
            url: "/contacts",
          },
        ],
      },
      {
        title: "Properties",
        url: "#",
        icon: Sparkles,
        isActive: false,
        items: [
          {
            title: "Properties List",
            url: "/properties",
          },
          {
            title: "Properties Map",
            url: "/properties/map",
          },
          {
            title: "Map",
            url: "/map",
          },
          {
            title: "Organizations",
            url: "/orgs",
          },
        ],
      },
      {
        title: "Information",
        url: "#",
        icon: BookOpen,
        isOpen: false,
        items: [
          {
            title: "About this app",
            url: "/about",
          },
          {
            title: "Terms of Service",
            url: "/terms",
          },
          {
            title: "Privacy Policy",
            url: "/privacy",
          },
        ],
      },
      {
        title: "Samples",
        url: "#",
        icon: Sparkles,
        isActive: false,
        items: [
          {
            title: "Alert",
            url: "/samples/alert",
          },
          {
            title: "Loading",
            url: "/samples/loading",
          },
        ],
      },
    ],
  };

  $effect(() => {
    // Set initial open state based on stored state
    data.navMain.forEach((item) => {
      if (sidebarState.openMenus.includes(item.title)) {
        item.isOpen = true;
      }
    });
  });
</script>

<Sidebar.Root class="z-50">
  <Sidebar.Header>
    <div class="pt-[var(--safe-area-inset-top,0px)]">
      <OrgSwitcher />
    </div>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.Menu>
        <SearchForm />
        {#each data.navMain as mainItem, index (mainItem.title)}
          <Collapsible.Root
            open={sidebarState.openMenus.includes(mainItem.title)}
            class="group/collapsible"
            onOpenChange={(isOpen) => {
              sidebarState.toggleMenu(mainItem.title, isOpen);
            }}
          >
            <Sidebar.MenuItem>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuButton {...props}>
                    {#if mainItem.icon}
                      <mainItem.icon class="mr-2 h-4 w-4" />
                    {/if}
                    {mainItem.title}
                    <Plus
                      class="ml-auto group-data-[state=open]/collapsible:hidden"
                    />
                    <Minus
                      class="ml-auto group-data-[state=closed]/collapsible:hidden"
                    />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>
              {#if mainItem.items?.length}
                <Collapsible.Content>
                  <Sidebar.MenuSub>
                    {#each mainItem.items as item (item.title)}
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton
                          isActive={sidebarState.activeItem === item.title}
                        >
                          {#snippet child({ props })}
                            <a
                              href={item.url}
                              {...props}
                              onclick={() =>
                                sidebarState.setActiveItem(item.title)}
                            >
                              {item.title}
                            </a>
                          {/snippet}
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              {/if}
            </Sidebar.MenuItem>
          </Collapsible.Root>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <div class="pb-[var(--safe-area-inset-bottom,0px)]">
      <NavUser />
    </div>
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
