<script lang="ts">
  import { page } from "$app/stores";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import type { Contact } from "$lib/services/contactService.svelte";
  import { ArrowLeft, Edit, Check, Trash2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { Textarea } from "$lib/components/ui/textarea";
  import { toast } from "svelte-sonner";
  import { alertManager } from "$lib/components/ui/alert/alert.svelte.ts";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import {
    upsertContact,
    getContactById,
    deleteContact,
  } from "$lib/services/contactService.svelte";

  const isNew = $derived($page.params.id === "new");
  const contactId = $derived($page.params.id);
  let isEditing = $state(false);

  $effect(() => {
    // Set initial editing state based on isNew
    isEditing = isNew;
  });

  let contact: Partial<Contact> = $state({});

  $effect(() => {
    // Initialize contact based on isNew condition
    contact = isNew
      ? {
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          address: "",
          address2: "",
          city: "",
          region: "",
          postal: "",
          country: "",
          notes: "",
          contact_type: "other",
        }
      : {};
  });

  let loading = $state(false);
  let error = $state<string | null>(null);

  const loadContact = async () => {
    const { data, error: err } = await getContactById(contactId);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    if (data && data.length > 0) {
      contact = data[0];
    }
  };

  async function load() {
    if (isNew) return;

    loading = true;
    error = null;

    await loadContact();

    loading = false;
  }

  async function handleSave() {
    loading = true;
    error = null;

    const { error: err } = await upsertContact(contact);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    // If this was a new contact, navigate to the contact list
    if (isNew) {
      goto("/contacts");
      return;
    }

    // For existing contacts, reload the data and exit edit mode
    await loadContact();
    loading = false;
    isEditing = false;
  }

  async function handleDelete() {
    if (!contact) return;

    const result = await alertManager.show({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this contact?",
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Delete", value: "delete", variant: "destructive" },
      ],
    });

    if (result === "delete") {
      loadingState.show("Deleting contact...");
      const { error } = await deleteContact(contact.id);
      loadingState.hide();

      if (error) {
        toast.error("ERROR", { description: error.message });
      } else {
        setTimeout(() => {
          toast.success("SUCCESS", { description: "Contact deleted" });
        }, 500);
        goto("/contacts");
      }
    }
  }

  $effect(() => {
    load();
  });

  const contactTypes = [
    { value: "owner", label: "Owner" },
    { value: "renter", label: "Renter" },
    { value: "provider", label: "Provider" },
    { value: "other", label: "Other" },
  ];

  const contactTypeContent = $derived(
    contactTypes.find((t) => t.value === contact.contact_type)?.label ??
      "Select contact type",
  );

  let actionItems = $derived([
    {
      icon: ArrowLeft,
      label: "Back to Contacts",
      href: "/contacts",
    },
    {
      icon: Edit,
      label: "Edit Contact",
      onClick: () => (isEditing = true),
      show: !isEditing && !isNew,
    },
    {
      icon: Check,
      label: "Save Contact",
      onClick: handleSave,
      show: isEditing || isNew,
    },
    {
      icon: Trash2,
      label: "Delete Contact",
      onClick: handleDelete,
      show: !isEditing && !isNew,
      variant: "destructive" as const,
    },
  ]);
</script>

<PageTemplate {actionItems}>
  {#snippet TopLeft()}
    <Button variant="ghost" size="icon" onclick={() => goto("/contacts")}>
      <ArrowLeft class="h-4 w-4" />
    </Button>
  {/snippet}

  {#snippet TopCenter()}
    {isNew ? "New Contact" : "Contact Details"}
  {/snippet}

  {#snippet Middle()}
    {#if loading}
      <div class="flex items-center justify-center h-full">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        ></div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full text-destructive">
        <p>{error}</p>
      </div>
    {:else}
      <div class="w-full flex justify-center">
        <div class="max-w-2xl w-full p-6">
          {#if isEditing || isNew}
            <form
              class="space-y-6"
              onsubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    bind:value={contact.firstname}
                    placeholder="Enter first name"
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
                    {contactTypeContent}
                  </Select.Trigger>
                  <Select.Content>
                    {#each contactTypes as type}
                      <Select.Item value={type.value}>{type.label}</Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>

              <div class="space-y-2">
                <Label for="address">Address</Label>
                <Input
                  id="address"
                  bind:value={contact.address}
                  placeholder="Enter street address"
                />
              </div>

              <div class="space-y-2">
                <Label for="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  bind:value={contact.address2}
                  placeholder="Enter apartment, suite, etc."
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="city">City</Label>
                  <Input
                    id="city"
                    bind:value={contact.city}
                    placeholder="Enter city"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="region">State/Region</Label>
                  <Input
                    id="region"
                    bind:value={contact.region}
                    placeholder="Enter state or region"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    bind:value={contact.postal}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="country">Country</Label>
                <Input
                  id="country"
                  bind:value={contact.country}
                  placeholder="Enter country"
                />
              </div>

              <div class="space-y-2">
                <Label for="notes">Notes</Label>
                <Textarea
                  id="notes"
                  bind:value={contact.notes}
                  placeholder="Enter any additional notes about the contact"
                  rows="4"
                />
              </div>

              <div class="flex justify-end">
                <Button type="submit" variant="secondary">Save Contact</Button>
              </div>
            </form>
          {:else}
            <div class="bg-background rounded-lg shadow-sm border border-border">
              <!-- Contact Header -->
              <div class="px-6 py-4 border-b border-border">
                <div class="flex items-center space-x-4">
                  <div
                    class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <span class="text-lg font-semibold text-primary">
                      {(contact.firstname?.[0] ?? "") +
                        (contact.lastname?.[0] ?? "")}
                    </span>
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-foreground">
                      {[contact.firstname, contact.lastname]
                        .filter(Boolean)
                        .join(" ")}
                    </h2>
                    {#if contact.contact_type}
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        {contact.contact_type === 'owner'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                          : contact.contact_type === 'renter'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                            : contact.contact_type === 'provider'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
                      >
                        {contact.contact_type}
                      </span>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Contact Details -->
              <div class="px-6 py-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Contact Information -->
                  <div class="space-y-4">
                    <h3
                      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Contact Information
                    </h3>
                    {#if contact.email}
                      <div class="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-muted-foreground"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                          />
                          <path
                            d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                          />
                        </svg>
                        <a
                          href="mailto:{contact.email}"
                          class="text-sm text-foreground hover:underline"
                          >{contact.email}</a
                        >
                      </div>
                    {/if}
                    {#if contact.phone}
                      <div class="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-muted-foreground"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                          />
                        </svg>
                        <a
                          href="tel:{contact.phone}"
                          class="text-sm text-foreground hover:underline"
                          >{contact.phone}</a
                        >
                      </div>
                    {/if}
                  </div>

                  <!-- Address Information -->
                  {#if contact.address}
                    <div class="space-y-4">
                      <h3
                        class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Address
                      </h3>
                      <div class="flex items-start space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-muted-foreground mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <div class="text-sm text-foreground">
                          <div>{contact.address}</div>
                          {#if contact.address2}
                            <div>{contact.address2}</div>
                          {/if}
                          <div>
                            {[contact.city, contact.region, contact.postal]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                          {#if contact.country}
                            <div>{contact.country}</div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Notes -->
                {#if contact.notes}
                  <div class="mt-6 space-y-4">
                    <h3
                      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Notes
                    </h3>
                    <div class="bg-muted/50 dark:bg-muted/900 rounded-lg p-4">
                      <p class="text-sm text-foreground whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  </div>
                {/if}

                <!-- System Information -->
                <div class="mt-6 pt-6 border-t border-border">
                  <div class="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    {#if contact.created_at}
                      <div>
                        Created: {new Date(
                          contact.created_at,
                        ).toLocaleDateString()}
                      </div>
                    {/if}
                    {#if contact.updated_at}
                      <div class="text-right">
                        Updated: {new Date(
                          contact.updated_at,
                        ).toLocaleDateString()}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/snippet}
</PageTemplate>
