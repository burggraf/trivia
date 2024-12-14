<script lang="ts">
  import {
    getMessage,
    markMessageAsUnread,
    markMessageAsRead,
    deleteMessage,
  } from "$lib/services/messageService.svelte";
  import { page } from "$app/stores";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import {
    ArrowLeft,
    Reply,
    Mail,
    MailOpen,
    Trash2,
    MailPlus,
    Forward,
  } from "lucide-svelte";
  import * as Table from "$lib/components/ui/table";
  import { getUser } from "$lib/services/backend.svelte";
  import ComposeMessageModal from "$lib/components/modals/ComposeMessageModal.svelte";
  import { toast } from "svelte-sonner";
  import HtmlContent from "$lib/components/HtmlContent.svelte";
  const user = $derived(getUser());
  const id = $derived($page.params.id);
  let message = $state<any | null>(null);
  let composeModalOpen = $state(false);
  let forwardModalOpen = $state(false);

  const actionItems: any[] = [
    {
      groupName: "Manage Message",
      groupItems: [
        {
          icon: Reply,
          label: "Reply",
          onClick: async () => {
            composeModalOpen = true;
          },
        },
        {
          icon: Forward,
          label: "Forward",
          onClick: async () => {
            forwardModalOpen = true;
          },
        },
        {
          icon: Mail,
          label: "Mark as unread",
          onClick: async () => {
            await markMessageAsUnread(id);
            load(false); // don't mark as read
          },
        },
        {
          icon: MailOpen,
          label: "Mark as read",
          onClick: async () => {
            await markMessageAsRead(id);
            load(true); // mark as read
          },
        },
        {
          icon: Trash2,
          label: "Delete Message",
          iconClasses: "stroke-destructive",
          textClasses: "text-destructive",
          onClick: async () => {
            const { error } = await deleteMessage(id);
            if (error) {
              console.error("deleteMessage error", error);
              toast.error("ERROR", {
                description: error,
              });
            } else {
              setTimeout(() => {
                toast.success("SUCCESS", {
                  description: "Message deleted",
                });
              }, 250);
              goto("/messages");
            }
          },
        },
      ],
    },
  ];

  const load = async (markRead = true) => {
    if (!user) {
      return;
    }
    const { data, error } = await getMessage(id);
    if (error) {
      console.error("getMessage error", error);
    }
    message = data;
    // find the recipient record for the current user then check if it's read_at is null
    const recipient = message.messages_recipients.find(
      (r: any) => r.recipient === user.id,
    );
    if (recipient) {
      // I am a recipient
      if (markRead && !recipient.read_at) {
        await markMessageAsRead(id);
        recipient.read_at = new Date().toISOString().toLocaleString();
      } else {
        // message already read
      }
    }
  };
  $effect(() => {
    load();
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const reply = async () => {};
  const replyAll = async () => {};
</script>

<PageTemplate {actionItems}>
  {#snippet TopLeft()}
    <Button
      variant="ghost"
      size="icon"
      onclick={() => {
        goto("/messages");
      }}
    >
      <ArrowLeft class="h-4 w-4" />
    </Button>
  {/snippet}

  {#snippet TopCenter()}
    Message Details
  {/snippet}

  {#snippet Middle()}
    {#if message}
      <div class="space-y-6">
        <!-- Message Content Section -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-2">{message.subject}</h2>
          <div
            class="flex items-center gap-x-4 text-sm text-muted-foreground mb-4"
          >
            <span
              ><b>FROM:</b>
              {message.sender_profile.email}
              &lt;{message.sender_profile.firstname}
              {message.sender_profile.lastname}&gt;</span
            >
            <span>•</span>
            <span>{formatDate(message.created_at)}</span>
          </div>
          <div class="rounded-lg bg-muted/50 p-4 w-full">
            <HtmlContent content={message.message} />
          </div>
        </div>

        <!-- Recipients Table -->
        <div>
          <h3 class="text-sm font-semibold mb-2">Recipients</h3>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head class="w-32">Read</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each message.messages_recipients as recipient}
                <Table.Row>
                  <Table.Cell
                    >{recipient.profiles.firstname}
                    {recipient.profiles.lastname}</Table.Cell
                  >
                  <Table.Cell>{recipient.profiles.email}</Table.Cell>
                  <Table.Cell
                    >{recipient.read_at
                      ? formatDate(recipient.read_at)
                      : "Unread"}</Table.Cell
                  >
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    {/if}
  {/snippet}
</PageTemplate>

<ComposeMessageModal bind:open={composeModalOpen} replyToMessage={message} />

<ComposeMessageModal bind:open={forwardModalOpen} forwardMessage={message} />
