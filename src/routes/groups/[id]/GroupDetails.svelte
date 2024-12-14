<script lang="ts">
  import {
    saveGroup,
    deleteGroup,
    getGroupById,
    fetchGroups,
  } from "@/services/groupService.svelte";
  import type { Group } from "@/services/groupService.svelte";
  import { goto } from "$app/navigation";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import SaveButton from "@/components/iconbuttons/SaveButton.svelte";
  import DeleteButton from "@/components/iconbuttons/DeleteButton.svelte";
  import { toast } from "svelte-sonner";
  import { alertManager } from "$lib/components/ui/alert/alert.svelte.ts";
  import CancelButton from "@/components/iconbuttons/CancelButton.svelte";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import { page } from "$app/stores";
  import {
    updateCurrentGroup,
    getCurrentGroup,
    getUser,
  } from "@/services/backend.svelte";

  const id = $derived($page.params.id);
  const user = $derived(getUser());

  let { group } = $props<{
    group: Group | null;
  }>();
  //let group = $state<Group | null>(null);
  let titleError = $state("");
  let isFormChanged = $state(false);

  // let group = $state<Group | null>(null);

  const load = async () => {
    if (id === "new") {
      group = {
        title: "",
        created_at: "",
        id: "",
        metadata: null,
      };
      return;
    } else {
      const { data, error } = await getGroupById(id);
      group = data;
      return data;
    }
  };
  $effect(() => {
    load();
  });

  function validateTitle(title: string) {
    if (!title.trim()) {
      titleError = "Title is required";
      return false;
    }
    titleError = "";
    return true;
  }
  function handleInput() {
    isFormChanged = true;
  }
  async function handleSubmit() {
    if (!group) return;

    if (!validateTitle(group.title)) {
      return;
    }

    loadingState.show("Saving groupanization...");
    const { data, error } = await saveGroup(group);
    loadingState.hide();
    if (error) {
      toast.error("ERROR", { description: (error as Error).message || error });
    } else {
      toast.success("SUCCESS", { description: "Groupanization updated" });
      isFormChanged = false;
      if (id === "new" && data && data.groupid) {
        if (data.groupid) {
          await updateCurrentGroup(data.groupid);
          goto(`/groups/${data.groupid}`);
        } else {
          goto("/groups");
        }
      } else {
        await updateCurrentGroup(id);
        goto(`/groups/${id}`);
      }
    }
  }
  async function handleCancel() {
    const data = await load();
    const titleInput: any = document.getElementById("title");
    isFormChanged = false;
    if (titleInput) {
      titleInput.value = data?.title ?? "";
    }
  }
  async function handleDelete() {
    if (group === null) return;
    const result = await alertManager.show({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this groupanization?",
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Delete", value: "delete", variant: "destructive" },
      ],
    });

    if (result === "delete") {
      // Store current group before deletion
      const currentGroup = getCurrentGroup();
      const isCurrentGroup = currentGroup?.id === group.id;

      // Handle delete action
      loadingState.show("Deleting groupanization...");
      const {
        data: { data, error },
      } = await deleteGroup(group);

      if (error) {
        loadingState.hide();
        toast.error("ERROR", { description: (error as Error).message });
      } else {
        // Only fetch and select new group if we deleted the current group
        if (isCurrentGroup) {
          const { data: groups, error: groupsError } = await fetchGroups();
          if (groupsError) {
            console.error("Error fetching groups after deletion:", groupsError);
          } else if (groups && groups.length > 0) {
            await updateCurrentGroup(groups[0].id);
          }
        }

        loadingState.hide();
        setTimeout(() => {
          toast.success("SUCCESS", { description: "Groupanization deleted" });
        }, 500);
        goto("/groups");
      }
    }
  }
</script>

<Card.Root class="w-[350px] md:w-[500px]">
  <Card.Header>
    <Card.Title>Details</Card.Title>
    <Card.Description>Details of the groupanization.</Card.Description>
  </Card.Header>
  <Card.Content>
    <form
      oninput={handleInput}
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div class="grid w-full items-center gap-4">
        <div class="flex flex-col space-y-1.5">
          <Label for="name">Title</Label>
          <Input
            id="title"
            value={group?.title ?? ""}
            placeholder="Title of your groupanization"
            class={titleError ? "border-destructive" : ""}
            oninput={(e) => {
              if (group) group.title = e.currentTarget.value;
              validateTitle(e.currentTarget.value);
            }}
          />
          {#if titleError}
            <p class="text-sm text-destructive">{titleError}</p>
          {/if}
        </div>
        {#if id !== "new"}
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Created</Label>
            <Input
              id="name"
              disabled
              value={group?.created_at?.substring(0, 10) ?? ""}
            />
          </div>
        {/if}
      </div>
    </form>
  </Card.Content>
  <Card.Footer class="flex justify-between">
    {#if id !== "new" && group?.id !== user?.id}
      <DeleteButton onclick={handleDelete} />
    {/if}
    {#if isFormChanged}
      <div>
        <CancelButton onclick={handleCancel} classes="mr-2" />
        <SaveButton onclick={handleSubmit} />
      </div>
    {/if}
  </Card.Footer>
</Card.Root>
