<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import {
    getUser,
    getProfile,
    updateProfile,
  } from "$lib/services/backend.svelte";
  import type { Profile } from "$lib/services/profileService.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { Check } from "lucide-svelte";
  import { beforeNavigate } from "$app/navigation";
  import SaveButton from "$lib/components/iconbuttons/SaveButton.svelte";

  const user = $derived(getUser());
  const profile: Profile | null = $derived(getProfile());

  let firstname = $state("");
  let lastname = $state("");
  let bio = $state("");

  let isFormChanged = $state(false);

  beforeNavigate(({ cancel }) => {
    if (isFormChanged) {
      if (
        !confirm(
          "You have unsaved changes. Do you want to leave without saving?",
        )
      ) {
        cancel();
      }
    }
  });

  // Add onInput handler to form
  function handleInput() {
    isFormChanged = true;
  }

  $effect(() => {
    firstname = profile?.firstname ?? "";
    lastname = profile?.lastname ?? "";
    bio = profile?.bio ?? "";

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  async function handleSubmit() {
    const { error } = await updateProfile({
      firstname,
      lastname,
      bio,
    });
    if (error) {
      toast.error("ERROR", {
        description: error.message || "unknown error",
      });
    } else {
      toast.success("SUCCESS", {
        description: "Profile updated",
      });
      isFormChanged = false;
    }
  }
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Account
  {/snippet}
  {#snippet TopRight()}
    {#if isFormChanged}
      <SaveButton onclick={handleSubmit} />
    {/if}
  {/snippet}

  {#snippet Middle()}
    <form
      class="w-full max-w-xl space-y-6"
      oninput={handleInput}
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <!-- First Name -->
      <div class="grid w-full gap-1.5">
        <Label for="firstname">First Name</Label>
        <Input
          id="firstname"
          bind:value={firstname}
          placeholder="Enter your first name"
        />
      </div>

      <!-- Last Name -->
      <div class="grid w-full gap-1.5">
        <Label for="lastname">Last Name</Label>
        <Input
          id="lastname"
          bind:value={lastname}
          placeholder="Enter your last name"
        />
      </div>

      <!-- Email (Read-only) -->
      <div class="grid w-full gap-1.5">
        <Label for="email">Email</Label>
        <Input id="email" type="email" value={user?.email ?? ""} disabled />
      </div>

      <!-- Bio -->
      <div class="grid w-full gap-1.5">
        <Label for="bio">Bio</Label>
        <Textarea
          id="bio"
          bind:value={bio}
          placeholder="Tell us about yourself"
          class="resize-y min-h-[100px]"
        />
      </div>
    </form>
  {/snippet}
</PageTemplate>
