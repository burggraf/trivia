<script lang="ts">
  import { getUser } from "$lib/services/backend.svelte";
  import { Bell, Mail, Building2 } from "lucide-svelte";
  import { setMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Popover from "$lib/components/ui/popover";
  import { t } from "$lib/i18n";
  import AnimatedBell from "$lib/components/iconbuttons/AnimatedBell.svelte";
  import InvitationsModal from "$lib/components/InvitationsModal.svelte";
  import { getNewInboxMessageCount } from "$lib/services/messageService.svelte";
  import { getPendingInviteCount } from "$lib/services/inviteService.svelte";
  import { goto } from "$app/navigation";
  const user = $derived(getUser());
  let showInvitations = $state(false);

  let open = $state(false);
  let messageCount = $state(0);
  let invitationCount = $state(0);
  const totalCount = $derived(messageCount + invitationCount);
  const getUnreadMessageCount = async () => {
    if (!user) return;
    const { data, error } = await getNewInboxMessageCount();
    if (error) {
      console.error("getNewInboxMessageCount error:", error);
    } else {
      if (data) {
        messageCount = data || 0;
      } else {
        messageCount = 0;
      }
    }
  };
  const getInviteCount = async () => {
    if (!user) return;
    const { data, error } = await getPendingInviteCount();
    if (error) {
      console.error("getPendingInviteCount error:", error);
    } else {
      invitationCount = data || 0;
    }
  };
  $effect(() => {
    getUnreadMessageCount();
    getInviteCount();
  });
  function setTheme(mode: "light" | "dark" | "system") {
    setMode(mode);
    open = false;
  }
  const openInvitationsDialog = () => {
    showInvitations = true;
    open = false;
  };
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    <Button variant="ghost" class="ml-2">
      {#if totalCount > 0}
        <Badge variant="destructive">{totalCount}</Badge>
      {/if}
      <AnimatedBell classes="h-4 w-4" fill="transparent" />
      <span class="sr-only">Message Indicator</span>
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-56" align="end">
    <div class="grid gap-4 text-center">
      <h4 class="font-medium leading-none">Waiting For You</h4>
      <Button
        onclick={openInvitationsDialog}
        variant="outline"
        class="flex items-center gap-2 w-full justify-start"
      >
        {#if invitationCount > 0}
          <Badge variant="destructive">{invitationCount}</Badge>
          <Building2 class="h-4 w-4" /> new invitation{invitationCount > 1
            ? "s"
            : ""}
        {:else}
          <Building2 class="h-4 w-4" /> no pending invitations
        {/if}
      </Button>
      <Button
        variant="outline"
        class="flex items-center gap-2 w-full justify-start"
        onclick={() => {
          goto("/messages");
        }}
      >
        {#if messageCount > 0}
          <Badge variant="destructive">{messageCount}</Badge>
          <Mail class="h-4 w-4" /> new message{messageCount > 1 ? "s" : ""}
        {:else}
          <Mail class="h-4 w-4" /> no new messages
        {/if}
      </Button>
    </div>
  </Popover.Content>
</Popover.Root>

<InvitationsModal bind:open={showInvitations} />
