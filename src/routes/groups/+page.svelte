<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";

  import {
    updateUser,
    getCurrentGroup,
    updateCurrentGroup,
    getUser,
  } from "$lib/services/backend.svelte";
  import { t } from "$lib/i18n/index";
  import { toast } from "svelte-sonner";
  import { Plus, CircleCheckBig, Circle } from "lucide-svelte";
  import { fetchGroups } from "@/services/groupService.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import { goto } from "$app/navigation";
  import { Button } from "@/components/ui/button";
  interface Group {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
  }
  const user = $derived(getUser());

  let groups = $state([] as Group[]);
  const currentGroup = $derived(getCurrentGroup());
  const load = async () => {
    // const { data, error } = await getAllGroups();
    const { data, error } = await fetchGroups();
    if (error) {
    } else {
      groups = data;
    }
  };
  async function handleGroupClick(group: Group) {
    goto(`/groups/${group.id}`);
  }
  $effect(() => {
    load();
  });

  async function handleNewGroupClick() {
    await goto("/groups/new");
  }

  async function handleSelectGroup(group: Group) {
    await updateCurrentGroup(group.id);
  }

  const headers = [{ key: "title", label: "groups.title", sortable: true }];
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
    {$t("group.listTitle")}
  {/snippet}
  {#snippet TopRight()}
    <Button
      variant="ghost"
      size="icon"
      onclick={handleNewGroupClick}
      class="h-9 w-9"
      aria-label={$t("group.addNew")}
    >
      <Plus class="w-6 h-6" />
    </Button>
  {/snippet}

  {#snippet Middle()}
    <div class="container mx-auto p-4">
      {#if user}
        <div class="space-y-6">
          <!-- Current Group display -->
          <!--
          <div class="bg-secondary p-4 rounded-lg mb-4">
            <h2 class="text-lg font-semibold mb-2">{$t("group.currentGroup")}</h2>
            {#if currentGroup}
              <p>{currentGroup.title}</p>
            {:else}
              <p class="text-gray-500">{$t("group.noCurrentGroup")}</p>
            {/if}
          </div>
		  -->
          <!--
          {#each groups as group}
            <Button
              type="button"
              class="w-full text-left"
              onclick={() => handleGroupClick(group)}
              onkeydown={(e) => e.key === "Enter" && handleGroupClick(group)}
            >
              {group.title}
            </Button>
          {/each}
		  -->

          <!--<GenericList data={groups} {headers} onRowClick={handleGroupClick} />-->
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Active</Table.Head>
                <Table.Head>Title</Table.Head>
                <Table.Head>Role</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each groups as group, i (i)}
                <Table.Row onclick={() => handleGroupClick(group)}>
                  <Table.Cell class="w-[30px] text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleSelectGroup(group);
                      }}
                      class="h-12 w-12"
                      aria-label={$t("group.addNew")}
                    >
                      {#if group.id === currentGroup?.id}
                        <CircleCheckBig class="w-6 h-6" />
                      {:else}
                        <Circle class="w-6 h-6" />
                      {/if}
                    </Button>
                  </Table.Cell>
                  <Table.Cell class="font-medium">{group.title}</Table.Cell>
                  <Table.Cell class="font-medium">{group.user_role}</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
            <!--
            <Table.Footer>
              <Table.Row>
                <Table.Cell colspan={3}>Total</Table.Cell>
                <Table.Cell class="text-right">$2,500.00</Table.Cell>
              </Table.Row>
            </Table.Footer>
			-->
          </Table.Root>
        </div>
      {:else}
        <p class="pt-8 text-center text-lg text-gray-500">
          {$t("common.notLoggedIn")}
        </p>
      {/if}
    </div>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
