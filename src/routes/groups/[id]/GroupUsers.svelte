<script lang="ts">
  import DeleteButton from "$lib/components/iconbuttons/DeleteButton.svelte";
  import type { Group } from "@/services/groupService.svelte";
  import {
    deleteGroupUser,
    getGroupUsers,
    updateUserRole,
  } from "@/services/groupService.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import RoleSelector from "./RoleSelector.svelte";
  import SaveButton from "@/components/iconbuttons/SaveButton.svelte";
  import { alertManager } from "$lib/components/ui/alert/alert.svelte.ts";
  import { toast } from "svelte-sonner";
  import { getUser } from "$lib/services/backend.svelte";
  const user = $derived(getUser());

  let { group } = $props<{
    group: Group | null;
  }>();

  let users = $state<any[]>([]);

  async function load() {
    if (group) {
      const { data, error } = await getGroupUsers(group);
      if (error) {
        console.error("getGroupUsers error", error);
        users = [];
      } else {
        const tempUsers = [];
        if (data) {
          for (let i = 0; i < data.length; i++) {
            const u = data[i];
            tempUsers.push({
              id: u.id,
              created_at: new Date(u.created_at).toLocaleDateString(),
              user_role: u.user_role,
              new_user_role: u.user_role,
              email: u.email,
              firstname: u.raw_user_meta_data.firstname || null,
              lastname: u.raw_user_meta_data.lastname || null,
              email_verified: u.raw_user_meta_data.email_verified,
            });
          }
        }
        users = tempUsers;
      }
    }
  }
  $effect(() => {
    load();
  });
  async function handleUpdateRole(user: any) {
    if (user === null) return;
    if (!user.new_user_role) return;
    const result = await alertManager.show({
      title: "Confirm Role Change",
      message: `Are you sure you want to change the role for ${user.email} from ${user.user_role} to ${user.new_user_role}?`,
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Update", value: "update", variant: "destructive" },
      ],
    });

    if (result === "update") {
      // Handle update action
      const { data, error } = await updateUserRole(user.id, user.new_user_role);
      if (error) {
        toast.error("ERROR", {
          description: (error as Error).message || error,
        });
      } else {
        // refresh the page here
        toast.success("SUCCESS", {
          description: "User role updated",
        });
        load();
        /*
        setTimeout(() => {
          window.location.reload();
        }, 1000);*/
        // goto("/groups");
      }
    }
  }

  async function handleDelete(user: any) {
    if (user === null) return;
    if (user.id === null) return;
    const result = await alertManager.show({
      title: "Confirm Remove User",
      message: `Are you sure you want to remove ${user.email} from this groupanization?`,
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Delete", value: "delete", variant: "destructive" },
      ],
    });

    if (result === "delete") {
      // Handle delete action
      const {
        data: { data, error },
      } = await deleteGroupUser(user.id);
      if (error) {
        toast.error("ERROR", {
          description: (error as Error).message,
        });
      } else {
        // refresh the page here
        toast.success("SUCCESS", {
          description: "User removed from groupanization",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // goto("/groups");
      }
    }
  }
</script>

<Card.Root class="w-[350px] md:w-[500px]">
  <Card.Header>
    <Card.Title>Users</Card.Title>
    <Card.Description>Users of this groupanization.</Card.Description>
  </Card.Header>
  <Card.Content class="pl-4 pr-4 pt-0">
    <Table.Root>
      <Table.Body>
        {#if users}
          {#each users as u, i (i)}
            <Table.Row>
              <Table.Cell
                class="w-[44px] max-w-[44px] m-0 p-0 hidden md:table-cell"
              >
                {#if u.email !== user?.email}
                  <DeleteButton
                    onclick={() => {
                      handleDelete(u);
                    }}
                    classes="m-0 p-0"
                  />
                {/if}
              </Table.Cell>
              <Table.Cell class="pl-2 w-[280px] max-w-[280px]">
                {u.email}<br />
                {#if u.firstname || u.lastname}
                  {u.firstname + " " + u.lastname}<br />
                {/if}
              </Table.Cell>
              <Table.Cell
                class="pl-2 pr-0 mr-0 w-[180px] min-w-[180px] max-w-[180px] hidden md:table-cell"
              >
                <div class="flex">
                  <RoleSelector
                    bind:value={u.new_user_role}
                    classes="w-[110px] max-w-[110px]"
                  />
                  <!--<UserRole user={u} classes="w-[110px] max-w-[110px]" />-->
                  {#if u.new_user_role && u.user_role !== u.new_user_role}
                    <SaveButton
                      onclick={() => {
                        handleUpdateRole(u);
                      }}
                      classes="ml-4"
                    />
                  {/if}
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </Card.Content>
</Card.Root>
