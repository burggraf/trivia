<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { getGroupById, getGroupUsers } from "@/services/groupService.svelte";

  import { goto } from "$app/navigation";
  import { ArrowLeft } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import GroupDetails from "./GroupDetails.svelte";
  import GroupUsers from "./GroupUsers.svelte";
  import GroupsInvites from "./GroupInvites.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { getUser } from "$lib/services/backend.svelte";
  const user = $derived(getUser());

  interface Group {
    id: string;
    title: string;
    created_at: string;
    metadata: any;
    user_role: string;
  }
  const id = $derived($page.params.id);
  let group = $state<Group | null>(null);
  //let users = $state<any[] | null>(null);

  const load = async () => {
    if (!user) return;
    if (id !== "new") {
      const { data, error } = await getGroupById(id);
      if (error) {
        console.error("getGroupById error", error);
        toast.error("ERROR", { description: (error as Error).message });
      } else {
        if (data) {
          group = data;
        } else {
          group = null;
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
        goto("/groups");
      }}
      class="h-9 w-9"
    >
      <ArrowLeft class="w-6 h-6" />
    </Button>
  {/snippet}
  {#snippet TopCenter()}
    {id === "new" ? "New Groupanization" : group?.title}
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
          <GroupDetails {group} />
        </Tabs.Content>
        <Tabs.Content value="users">
          {#if group?.user_role === "Admin"}
            <GroupUsers {group} />
          {:else}
            <p><br />You are not an admin of this groupanization</p>
          {/if}
        </Tabs.Content>
        <Tabs.Content value="invites">
          {#if group?.user_role === "Admin"}
            <GroupsInvites {group} />
          {:else}
            <p><br />You are not an admin of this groupanization</p>
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
