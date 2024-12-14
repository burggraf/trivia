<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { getOrgById, getOrgUsers } from "$lib/services/orgService.svelte";

  import { goto } from "$app/navigation";
  import { ArrowLeft } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import OrgDetails from "./OrgDetails.svelte";
  import OrgUsers from "./OrgUsers.svelte";
  import OrgsInvites from "./OrgsInvites.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { getUser } from "$lib/services/backend.svelte";
  const user = $derived(getUser());

  interface Org {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
  }
  const id = $derived($page.params.id);
  let org = $state<Org | null>(null);
  //let users = $state<any[] | null>(null);

  const load = async () => {
    if (!user) return;
    if (id !== "new") {
      const { data, error } = await getOrgById(id);
      if (error) {
        console.error("getOrgById error", error);
        toast.error("ERROR", { description: (error as Error).message });
      } else {
        if (data) {
          org = data;
        } else {
          org = null;
        }
      }
    }
  };
  $effect(() => {
    load();
  });
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  {#snippet TopLeft()}
    <Button
      variant="ghost"
      size="icon"
      onclick={() => {
        goto("/orgs");
      }}
      class="h-9 w-9"
    >
      <ArrowLeft class="w-6 h-6" />
    </Button>
  {/snippet}
  {#snippet TopCenter()}
    {id === "new" ? "New Organization" : org?.title}
  {/snippet}
  {#snippet TopRight()}
    <!--
    {#if isFormChanged}
      <SaveButton onclick={handleSubmit} />
    {/if}
   -->
  {/snippet}

  {#snippet Middle()}
    <div class="flex items-center justify-center">
      <Tabs.Root value="details" class="w-[350px] md:w-[500px]">
        <Tabs.List>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="invites">Invites</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="details">
          <OrgDetails {org} />
        </Tabs.Content>
        <Tabs.Content value="users">
          {#if org?.user_role === "Admin"}
            <OrgUsers {org} />
          {:else}
            <p><br />You are not an admin of this organization</p>
          {/if}
        </Tabs.Content>
        <Tabs.Content value="invites">
          {#if org?.user_role === "Admin"}
            <OrgsInvites {org} />
          {:else}
            <p><br />You are not an admin of this organization</p>
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
