<script lang="ts">
  import DeleteButton from "$lib/components/iconbuttons/DeleteButton.svelte";
  import type { Group } from "@/services/groupService.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import AddButton from "$lib/components/iconbuttons/AddButton.svelte";
  import RoleSelector from "./RoleSelector.svelte";
  import { toast } from "svelte-sonner";
  import { getUser } from "$lib/services/backend.svelte";
  import {
    getInvites,
    createInvite,
    deleteInvite,
  } from "$lib/services/inviteService.svelte";
  import type { Invite } from "$lib/services/inviteService.svelte";
  import { cn } from "$lib/utils";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";

  const user = $derived(getUser());

  let { group } = $props<{
    group: Group | null;
  }>();

  let invites = $state<Invite[]>([]);
  const load = async () => {
    if (!group) return;
    const { data, error } = await getInvites(group.id);
    invites = data || [];
  };
  $effect(() => {
    load();
  });

  let newInviteEmail = $state("");
  let isEmailValid = $derived(validateEmail(newInviteEmail));
  let showValidation = $state(false);

  let selectedRole = $state("Member"); // Default to 'Member'

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return isValid;
  }

  async function handleDelete(id: string) {
    loadingState.show("Deleting invite...");
    const {
      data: { data, error },
      error: createError,
    } = await deleteInvite(id);
    loadingState.hide();
    if (error) {
      toast.error("ERROR", { description: error });
    } else {
      load();
      toast.success("SUCCESS", { description: "Invite deleted" });
    }
  }

  async function handleAdd() {
    showValidation = true;
    if (!isEmailValid) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address",
      });
      return;
    }
    loadingState.show("Creating invite...");
    console.log("handleAdd", group.id, newInviteEmail, selectedRole);
    const {
      data: { data, error },
      error: createError,
    } = await createInvite(group.id, newInviteEmail, selectedRole);
    loadingState.hide();
    if (error) {
      toast.error("ERROR", { description: error.message || error });
    } else {
      load();
      newInviteEmail = "";
      showValidation = false;
      toast.success("SUCCESS", { description: "Invite created" });
    }
  }
</script>

<Card.Root class="w-[350px] md:w-[500px]">
  <Card.Header>
    <Card.Title>Invites</Card.Title>
    <Card.Description>Invitations to join this group.</Card.Description>
  </Card.Header>
  <Card.Content class="pl-4 pr-4 pt-0">
    <Table.Root>
      <Table.Body>
        {#if invites}
          {#each invites as inv, i (i)}
            <Table.Row>
              <Table.Cell
                class="w-[44px] max-w-[44px] m-0 p-0 hidden md:table-cell"
              >
                <DeleteButton
                  onclick={() => {
                    // handleDelete(inv);
                    handleDelete(inv.id);
                  }}
                  classes="m-0 p-0"
                />
              </Table.Cell>
              <Table.Cell class="pl-2 w-[280px] max-w-[280px]">
                {inv.email}<br />
              </Table.Cell>
              <Table.Cell
                class="pl-2 pr-0 mr-0 w-[180px] min-w-[180px] max-w-[180px] hidden md:table-cell"
              >
                <div class="flex">
                  {inv.user_role}
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}

          {#if group}
            <Table.Row>
              <Table.Cell
                class="w-[44px] max-w-[44px] m-0 p-0 hidden md:table-cell"
              >
                <AddButton
                  onclick={() => {
                    handleAdd();
                  }}
                  classes="m-0 p-0"
                />
              </Table.Cell>
              <Table.Cell class="pl-2 w-[280px] max-w-[280px]">
                <div class="flex flex-col space-y-1">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    bind:value={newInviteEmail}
                    class={cn(
                      "w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary",
                      showValidation && !isEmailValid && "border-destructive",
                      showValidation && isEmailValid && "border-green-500",
                    )}
                  />
                  {#if showValidation && !isEmailValid}
                    <span
                      class="text-xs text-destructive bg-destructive/10 p-1 rounded"
                    >
                      Please enter a valid email address
                    </span>
                  {/if}
                </div>
              </Table.Cell>
              <Table.Cell
                class="pl-2 pr-0 mr-0 w-[180px] min-w-[180px] max-w-[180px] hidden md:table-cell"
              >
                <div class="flex">
                  <RoleSelector
                    classes="w-[110px] max-w-[110px]"
                    bind:value={selectedRole}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          {/if}
        {/if}
      </Table.Body>
    </Table.Root>
  </Card.Content>
</Card.Root>
