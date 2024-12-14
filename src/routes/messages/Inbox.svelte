<script lang="ts">
  import { getInboxMessages } from "$lib/services/messageService.svelte";
  import type { Message } from "$lib/services/messageService.svelte";
  import * as Table from "$lib/components/ui/table";
  import { goto } from "$app/navigation";
  import { getUser } from "$lib/services/backend.svelte";
  import { getMessageRefreshCounter } from "$lib/state/messageState.svelte";
  import StarNew from "$lib/components/iconbuttons/StarNew.svelte";
  const user = $derived(getUser());
  const refreshCounter = $derived(getMessageRefreshCounter());

  let inboxMessages = $state<any[]>([]);

  const load = async () => {
    if (!user) {
      return;
    }
    const { data, error } = await getInboxMessages(0, 100);
    if (error) {
      console.error(error);
    } else if (data) {
      inboxMessages = data;
    }
  };

  $effect(() => {
    load();
    refreshCounter; // Reference the counter to make the effect reactive to it
  });
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Subject</Table.Head>
      <Table.Head>Sender</Table.Head>
      <Table.Head>Date</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each inboxMessages as message}
      <Table.Row
        onclick={() => {
          goto(`/messages/${message.id}`);
        }}
      >
        <Table.Cell class="font-medium"
          >{#if message.messages_recipients[0].read_at === null}
            <StarNew iconClasses="text-red-500 fill-current" />
          {/if}{message.subject}</Table.Cell
        >
        <Table.Cell
          >{message.sender_email}<br />
          {message.sender_firstname}
          {message.sender_lastname}</Table.Cell
        >
        <Table.Cell
          >{@html message.created_at.replace(", ", "<br/>")}</Table.Cell
        >
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
