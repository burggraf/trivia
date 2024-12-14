<script lang="ts">
  import {
    saveOrg,
    deleteOrg,
    getOrgById,
    fetchOrgs,
  } from "$lib/services/orgService.svelte";
  import type { Org } from "$lib/services/orgService.svelte";
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
  import { updateCurrentOrg, getCurrentOrg, getUser } from "@/services/backend.svelte";

  const id = $derived($page.params.id);
  const user = $derived(getUser());

  let { org } = $props<{
    org: Org | null;
  }>();
  //let org = $state<Org | null>(null);
  let titleError = $state("");
  let isFormChanged = $state(false);

  // let org = $state<Org | null>(null);

  const load = async () => {
    if (id === "new") {
      org = {
        title: "",
        created_at: "",
        id: "",
        metadata: null,
      };
      return;
    } else {
      const { data, error } = await getOrgById(id);
      org = data;
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
    if (!org) return;

    if (!validateTitle(org.title)) {
      return;
    }

    loadingState.show("Saving organization...");
    const { data, error } = await saveOrg(org);
    loadingState.hide();
    if (error) {
      toast.error("ERROR", { description: (error as Error).message || error });
    } else {
      toast.success("SUCCESS", { description: "Organization updated" });
      isFormChanged = false;
      if (id === "new" && data && data.orgid) {
        if (data.orgid) {
          await updateCurrentOrg(data.orgid);
          goto(`/orgs/${data.orgid}`);
        } else {
          goto("/orgs");
        }
      } else {
        await updateCurrentOrg(id);
        goto(`/orgs/${id}`);
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
    if (org === null) return;
    const result = await alertManager.show({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this organization?",
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Delete", value: "delete", variant: "destructive" },
      ],
    });

    if (result === "delete") {
      // Store current org before deletion
      const currentOrg = getCurrentOrg();
      const isCurrentOrg = currentOrg?.id === org.id;

      // Handle delete action
      loadingState.show("Deleting organization...");
      const {
        data: { data, error },
      } = await deleteOrg(org);
      
      if (error) {
        loadingState.hide();
        toast.error("ERROR", { description: (error as Error).message });
      } else {
        // Only fetch and select new org if we deleted the current org
        if (isCurrentOrg) {
          const { data: orgs, error: orgsError } = await fetchOrgs();
          if (orgsError) {
            console.error("Error fetching orgs after deletion:", orgsError);
          } else if (orgs && orgs.length > 0) {
            await updateCurrentOrg(orgs[0].id);
          }
        }
        
        loadingState.hide();
        setTimeout(() => {
          toast.success("SUCCESS", { description: "Organization deleted" });
        }, 500);
        goto("/orgs");
      }
    }
  }
</script>

<Card.Root class="w-[350px] md:w-[500px]">
  <Card.Header>
    <Card.Title>Details</Card.Title>
    <Card.Description>Details of the organization.</Card.Description>
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
            value={org?.title ?? ""}
            placeholder="Title of your organization"
            class={titleError ? "border-destructive" : ""}
            oninput={(e) => {
              if (org) org.title = e.currentTarget.value;
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
              value={org?.created_at?.substring(0, 10) ?? ""}
            />
          </div>
        {/if}
      </div>
    </form>
  </Card.Content>
  <Card.Footer class="flex justify-between">
    {#if id !== "new" && org?.id !== user?.id}
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
