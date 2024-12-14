<script lang="ts">
  import type { Contact } from "$lib/services/contactService.svelte";
  import { upsertContact } from "$lib/services/contactService.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    save: Contact;
  }>();
  
  const { initialContact = {
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    contact_type: "other",
  } } = $props<{
    initialContact?: Partial<Contact>;
  }>();

  let contact = $state<Partial<Contact>>({ ...initialContact });
  let loading = $state(false);
  let error = $state<string | null>(null);

  const contactTypes = [
    { value: "owner", label: "Owner" },
    { value: "renter", label: "Renter" },
    { value: "provider", label: "Provider" },
    { value: "other", label: "Other" },
  ];

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;

    if (!contact.firstname?.trim()) {
      error = "First name is required";
      loading = false;
      return;
    }

    const { data, error: err } = await upsertContact(contact);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    if (!data) {
      error = "Failed to create contact";
      loading = false;
      return;
    }

    dispatch("save", data);
    loading = false;
  }
</script>

<form class="space-y-6" on:submit={handleSubmit}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-2">
      <Label for="firstname">First Name *</Label>
      <Input
        id="firstname"
        bind:value={contact.firstname}
        placeholder="Enter first name"
        required
      />
    </div>
    <div class="space-y-2">
      <Label for="lastname">Last Name</Label>
      <Input
        id="lastname"
        bind:value={contact.lastname}
        placeholder="Enter last name"
      />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        type="email"
        bind:value={contact.email}
        placeholder="Enter email address"
      />
    </div>
    <div class="space-y-2">
      <Label for="phone">Phone</Label>
      <Input
        id="phone"
        type="tel"
        bind:value={contact.phone}
        placeholder="Enter phone number"
      />
    </div>
  </div>

  <div class="space-y-2">
    <Label for="contact_type">Contact Type</Label>
    <Select.Root type="single" bind:value={contact.contact_type}>
      <Select.Trigger class="w-full">
        {contactTypes.find((t) => t.value === contact.contact_type)?.label ?? "Select type..."}
      </Select.Trigger>
      <Select.Content>
        {#each contactTypes as type}
          <Select.Item value={type.value}>{type.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  {#if error}
    <div class="text-destructive">{error}</div>
  {/if}

  <div class="flex justify-end">
    <slot name="actions">
      <button
        type="submit"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Contact"}
      </button>
    </slot>
  </div>
</form>
