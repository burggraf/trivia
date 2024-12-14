<script lang="ts">
  import { getSentMessages } from "$lib/services/messageService.svelte";
  import type { Message } from "$lib/services/messageService.svelte";
  import GenericList from "$lib/components/GenericList.svelte";
  import * as Table from "$lib/components/ui/table";
  import { getUser } from "$lib/services/backend.svelte";
  import { getMessageRefreshCounter } from "$lib/state/messageState.svelte";
  import { goto } from "$app/navigation";
  const user = $derived(getUser());
  const refreshCounter = $derived(getMessageRefreshCounter());

  let sentMessages = $state<any[]>([]);
  const load = async () => {
    if (!user) {
      return;
    }
    const { data, error } = await getSentMessages(0, 100);
    if (error) {
      console.error(error);
    } else if (data) {
      sentMessages = data;
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
      <Table.Head>Recipient(s)</Table.Head>
      <Table.Head>Date</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each sentMessages as message}
      <Table.Row
        onclick={() => {
          goto(`/messages/${message.id}`);
        }}
      >
        <Table.Cell class="font-medium">{message.subject}</Table.Cell>
        <Table.Cell
          >{message.recipients.map((recipient: any) => {
            return (
              " " +
              recipient.email +
              (recipient.firstname || recipient.lastname
                ? " <" +
                  (recipient.firstname + " " + recipient.lastname).trim() +
                  ">"
                : "")
            );
          })}</Table.Cell
        >
        <Table.Cell>
          {@html message.created_at.replace(", ", "<br/>")}
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
