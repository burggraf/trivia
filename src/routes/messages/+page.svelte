<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import Inbox from "./Inbox.svelte";
  import Outbox from "./Outbox.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import AddNewMessageButton from "$lib/components/iconbuttons/AddNewMessageButton.svelte";
  import ComposeMessageModal from "$lib/components/modals/ComposeMessageModal.svelte";

  let composeModalOpen = $state(false);

  /*
  const actionItems: any[] = [
    {
      groupName: "Group Header Here",
      groupItems: [
        {
          icon: IconFromLucide,
          label: "Item Label Here",
          onClick: () => {console.log("item was clicked")},
        },
      ],
    }
  ];
  */
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  <!--{#snippet TopLeft()}{/snippet}-->
  {#snippet TopCenter()}
    Messages
  {/snippet}
  {#snippet TopRight()}
    <AddNewMessageButton onclick={() => (composeModalOpen = true)} classes="" />
  {/snippet}

  {#snippet Middle()}
    <div class="flex items-center justify-center">
      <Tabs.Root value="inbox" class="w-[350px] md:w-full">
        <Tabs.List>
          <Tabs.Trigger value="inbox">Inbox</Tabs.Trigger>
          <Tabs.Trigger value="outbox">Sent Messages</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="inbox">
          <Inbox />
        </Tabs.Content>
        <Tabs.Content value="outbox">
          <Outbox />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>

<ComposeMessageModal bind:open={composeModalOpen} />
