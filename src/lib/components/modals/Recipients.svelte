<script lang="ts">
  import { getProfiles } from "$lib/services/profileService.svelte";
  import type { Profile } from "$lib/services/profileService.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  // Props
  let { open = $bindable(false), onSelect } = $props<{
    open?: boolean;
    onSelect: (selected: Profile[]) => void;
  }>();

  // State
  let profiles: Profile[] = $state([]);
  let selectedProfiles: Set<string> = $state(new Set());

  const load = async () => {
    const { data, error } = await getProfiles();
    if (error) {
      console.error(error);
    }
    if (data) {
      profiles = data;
    }
  };

  function toggleSelection(profileId: string) {
    selectedProfiles = new Set([...selectedProfiles]);
    if (selectedProfiles.has(profileId)) {
      selectedProfiles.delete(profileId);
    } else {
      selectedProfiles.add(profileId);
    }
  }

  function handleConfirm() {
    const selected = profiles.filter((p) => selectedProfiles.has(p.id));
    onSelect(selected);
    open = false;
  }

  $effect(() => {
    if (open) {
      selectedProfiles = new Set();
      load();
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Select Recipients</Dialog.Title>
      <Dialog.Description>Choose who you want to message</Dialog.Description>
    </Dialog.Header>

    <div class="max-h-[300px] overflow-y-auto">
      {#each profiles as profile}
        <button
          type="button"
          class={cn(
            "w-full text-left flex items-center p-2 hover:bg-muted cursor-pointer rounded-md",
            selectedProfiles.has(profile.id) && "bg-muted",
          )}
          onclick={() => toggleSelection(profile.id)}
        >
          <div class="flex-1">
            <h4 class="text-sm font-medium">{profile.email}</h4>
            {#if profile.firstname || profile.lastname}
              <p class="text-sm text-muted-foreground">
                {profile.firstname || ""}
                {profile.lastname || ""}
              </p>
            {:else}<p class="text-sm text-muted-foreground">&nbsp;</p>
            {/if}
          </div>
          {#if selectedProfiles.has(profile.id)}
            <div class="text-primary">✓</div>
          {/if}
        </button>
      {/each}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={handleConfirm}>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
