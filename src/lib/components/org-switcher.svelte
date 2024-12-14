<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import { ChevronsUpDown, Plus, UserPlus } from "lucide-svelte";
  import {
    getCurrentOrg,
    getUser,
    updateCurrentOrg,
  } from "$lib/services/backend.svelte";
  import { fetchOrgs } from "$lib/services/orgService.svelte";
  import { Star } from "lucide-svelte";
  import { goto } from "$app/navigation";
  interface Org {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
  }
  const org: Org | null = $derived(getCurrentOrg());
  const user = $derived(getUser());

  let orgs = $state([] as Org[]);
  let showLoginModal = $state(false);
  let isInitialized = $state(false);

  const sidebar = useSidebar();
  const load = async () => {
    const { data, error } = await fetchOrgs();
    if (error) {
      console.error("Error fetching orgs:", error);
      orgs = [];
    } else {
      orgs = data;
      // Only try to select first org if we've confirmed there's no current org after initialization
      if (isInitialized && !org && orgs.length > 0) {
        handleSelectOrg(orgs[0].id);
      }
    }
  };

  // Track when org state is initialized
  $effect(() => {
    if (org !== undefined) {
      isInitialized = true;
    }
  });

  // Reload orgs when user changes
  $effect(() => {
    if (user) {
      load();
    } else {
      orgs = [];
      isInitialized = false;
    }
  });
  async function handleOrgChange(id: string) {
    return await updateCurrentOrg(id);
  }
  const handleSelectOrg = async (id: string) => {
    const success = await handleOrgChange(id);
    if (!success) {
      console.error("Error switching organization");
    }
  };
</script>

<LoginModal bind:open={showLoginModal} />

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg"
            >
              <Star class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {org?.title || "No Org Selected"}
              </span>
              <span class="truncate text-xs">{org?.user_role}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
        align="start"
        side={sidebar.isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenu.Label class="text-muted-foreground text-xs"
          >Orgs</DropdownMenu.Label
        >
        {#each orgs as o, index}
          <DropdownMenu.Item
            onSelect={() => {
              handleSelectOrg(o.id);
            }}
            class="gap-2 p-2"
          >
            <div class="flex size-6 items-center justify-center rounded-sm">
              <Star class="size-4 shrink-0" />
            </div>
            {o.title} [{o.user_role}]
            <!--<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>-->
          </DropdownMenu.Item>
        {/each}
        <DropdownMenu.Separator />
        {#if user}
          <DropdownMenu.Item
            class="gap-2 p-2"
            onclick={() => {
              goto("/orgs/new");
            }}
          >
            <div
              class="bg-background flex size-6 items-center justify-center rounded-md border"
            >
              <Plus class="size-4" />
            </div>
            <div class="text-muted-foreground font-medium">Add New Org</div>
          </DropdownMenu.Item>
        {:else}
          <DropdownMenu.Item
            class="gap-2 p-2"
            onclick={() => {
              showLoginModal = true;
            }}
          >
            <div
              class="bg-background flex size-6 items-center justify-center rounded-md border"
            >
              <UserPlus class="size-4" />
            </div>
            <div class="text-muted-foreground font-medium">
              Login to see your orgs
            </div>
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
