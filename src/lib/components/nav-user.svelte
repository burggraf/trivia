<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import { getAvatarUrl, getUser, signOut } from "$lib/services/backend.svelte";
  import LoginModal from "$lib/components/LoginModal.svelte";
  import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
    UserPlus,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";

  const user = $derived(getUser());
  const avatarUrl = $derived(getAvatarUrl(user));
  const sidebar = useSidebar();
  let showLoginModal = $state(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const navigateToAccount = () => {
    goto("/account");
  };
</script>

<LoginModal bind:open={showLoginModal} />

<Sidebar.Menu>
  <Sidebar.MenuItem>
    {#if user}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="h-8 w-8 rounded-lg">
              <Avatar.Image src={avatarUrl} alt={user?.email} />
              <Avatar.Fallback class="rounded-lg"
                >{getInitials(user?.email || "?")}</Avatar.Fallback
              >
            </Avatar.Root>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{user?.email}</span>
              <span class="truncate text-xs">{user?.email}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </Sidebar.MenuButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
          side={sidebar.isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Label class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar.Root class="h-8 w-8 rounded-lg">
                <Avatar.Image src={avatarUrl} alt={user?.email} />
                <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
              </Avatar.Root>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{user?.email}</span>
                <span class="truncate text-xs">{user?.email}</span>
              </div>
            </div>
          </DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Item>
              <Sparkles />
              Upgrade to Pro
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Item onclick={navigateToAccount}>
              <BadgeCheck />
              Account
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <CreditCard />
              Billing
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Bell />
              Notifications
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={signOut}>
            <LogOut />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      <Sidebar.MenuButton
        size="lg"
        class="w-full"
        onclick={() => (showLoginModal = true)}
      >
        <Avatar.Root class="h-8 w-8 rounded-lg">
          <Avatar.Fallback class="rounded-lg">
            <UserPlus class="size-4" />
          </Avatar.Fallback>
        </Avatar.Root>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-semibold">Sign In or</span>
          <span class="truncate text-xs">Create an account</span>
        </div>
      </Sidebar.MenuButton>
    {/if}
  </Sidebar.MenuItem>
</Sidebar.Menu>
