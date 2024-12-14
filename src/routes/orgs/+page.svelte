<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";

  import {
    updateUser,
    getCurrentOrg,
    updateCurrentOrg,
    getUser,
  } from "$lib/services/backend.svelte";
  import { t } from "$lib/i18n/index";
  import { toast } from "svelte-sonner";
  import { Plus, CircleCheckBig, Circle } from "lucide-svelte";
  import { fetchOrgs } from "$lib/services/orgService.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import { goto } from "$app/navigation";
  import { Button } from "@/components/ui/button";
  interface Org {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
  }
  const user = $derived(getUser());

  let orgs = $state([] as Org[]);
  const currentOrg = $derived(getCurrentOrg());
  const load = async () => {
    // const { data, error } = await getAllOrgs();
    const { data, error } = await fetchOrgs();
    if (error) {
    } else {
      orgs = data;
    }
  };
  async function handleOrgClick(org: Org) {
    goto(`/orgs/${org.id}`);
  }
  $effect(() => {
    load();
  });

  async function handleNewOrgClick() {
    await goto("/orgs/new");
  }

  async function handleSelectOrg(org: Org) {
    await updateCurrentOrg(org.id);
  }

  const headers = [{ key: "title", label: "orgs.title", sortable: true }];
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
    {$t("org.listTitle")}
  {/snippet}
  {#snippet TopRight()}
    <Button
      variant="ghost"
      size="icon"
      onclick={handleNewOrgClick}
      class="h-9 w-9"
      aria-label={$t("org.addNew")}
    >
      <Plus class="w-6 h-6" />
    </Button>
  {/snippet}

  {#snippet Middle()}
    <div class="container mx-auto p-4">
      {#if user}
        <div class="space-y-6">
          <!-- Current Org display -->
          <!--
          <div class="bg-secondary p-4 rounded-lg mb-4">
            <h2 class="text-lg font-semibold mb-2">{$t("org.currentOrg")}</h2>
            {#if currentOrg}
              <p>{currentOrg.title}</p>
            {:else}
              <p class="text-gray-500">{$t("org.noCurrentOrg")}</p>
            {/if}
          </div>
		  -->
          <!--
          {#each orgs as org}
            <Button
              type="button"
              class="w-full text-left"
              onclick={() => handleOrgClick(org)}
              onkeydown={(e) => e.key === "Enter" && handleOrgClick(org)}
            >
              {org.title}
            </Button>
          {/each}
		  -->

          <!--<GenericList data={orgs} {headers} onRowClick={handleOrgClick} />-->
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Active</Table.Head>
                <Table.Head>Title</Table.Head>
                <Table.Head>Role</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each orgs as org, i (i)}
                <Table.Row onclick={() => handleOrgClick(org)}>
                  <Table.Cell class="w-[30px] text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleSelectOrg(org);
                      }}
                      class="h-12 w-12"
                      aria-label={$t("org.addNew")}
                    >
                      {#if org.id === currentOrg?.id}
                        <CircleCheckBig class="w-6 h-6" />
                      {:else}
                        <Circle class="w-6 h-6" />
                      {/if}
                    </Button>
                  </Table.Cell>
                  <Table.Cell class="font-medium">{org.title}</Table.Cell>
                  <Table.Cell class="font-medium">{org.user_role}</Table.Cell>
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
