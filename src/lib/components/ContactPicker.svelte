<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Search, Plus } from "lucide-svelte";
  import type { Contact } from "$lib/services/contactService.svelte";
  import { getContacts } from "$lib/services/contactService.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import ContactForm from "./ContactForm.svelte";

  const dispatch = createEventDispatcher();
  let isOpen = $state(false);
  let showNewContactModal = $state(false);

  // Add debug logging for state changes
  $effect(() => {
    console.log("ContactPicker: isOpen changed to", isOpen);
  });

  $effect(() => {
    console.log("ContactPicker: selectedContactType changed to", selectedContactType);
  });

  let contacts = $state<Contact[]>([]);
  let filteredContacts = $state<Contact[]>([]);
  let searchQuery = $state("");
  let selectedContactType = $state("primary");
  let loading = $state(false);
  let error = $state<string | null>(null);

  const contactTypes = [
    { value: "primary", label: "Primary" },
    { value: "tenant", label: "Tenant" },
    { value: "owner", label: "Owner" },
    { value: "agent", label: "Agent" },
    { value: "manager", label: "Manager" },
    { value: "contractor", label: "Contractor" },
  ];

  function selectContact(contact: Contact) {
    if (!contact?.id) {
      console.error("ContactPicker: Invalid contact - missing ID", contact);
      return;
    }

    console.log("ContactPicker: selectContact called with", contact);
    console.log("ContactPicker: current selectedContactType is", selectedContactType);
    const detail = { id: contact.id, contact_type: selectedContactType };
    console.log("ContactPicker: dispatching select event with detail", detail);
    dispatch("select", detail);
    isOpen = false;
  }

  async function loadContacts() {
    loading = true;
    error = null;
    console.log("Loading contacts...");

    const { data, error: err } = await getContacts();

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    contacts = data || [];
    filterContacts();
    loading = false;
    console.log("Contacts loaded:", contacts);
  }

  function filterContacts() {
    if (!searchQuery?.trim()) {
      filteredContacts = contacts;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredContacts = contacts.filter((contact) => {
      const searchFields = [
        contact.firstname,
        contact.lastname,
        contact.email,
        contact.phone,
      ];
      return searchFields.some(
        (field) => field && field.toLowerCase().includes(query),
      );
    });
  }

  function handleNewContactSave(event: CustomEvent<Contact>) {
    const newContact = event.detail;
    if (!newContact?.id) {
      console.error("ContactPicker: Invalid contact data from save event", newContact);
      return;
    }

    console.log("ContactPicker: New contact saved", newContact);
    contacts = [newContact, ...contacts];
    filterContacts();
    showNewContactModal = false;
    selectContact(newContact);
  }

  // Load contacts when component mounts
  $effect(() => {
    loadContacts();
  });

  // Filter contacts when search query changes
  $effect(() => {
    filterContacts();
  });
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger asChild>
    <slot />
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay
      class="bg-black/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <Dialog.Content class="sm:max-w-[600px]">
      <Dialog.Header>
        <Dialog.Title>Select Contact</Dialog.Title>
        <Dialog.Description>
          Choose a contact and their role for this property
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="grid gap-2 flex-1">
            <Label for="contact_type">Contact Type</Label>
            <Select.Root type="single" bind:value={selectedContactType}>
              <Select.Trigger class="w-full">
                {contactTypes.find((t) => t.value === selectedContactType)
                  ?.label ?? "Select type..."}
              </Select.Trigger>
              <Select.Content>
                {#each contactTypes as type}
                  <Select.Item value={type.value}>{type.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          <div class="ml-4 flex items-end">
            <Button onclick={() => showNewContactModal = true}>
              <Plus class="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </div>
        </div>

        <div class="relative">
          <Search
            class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search contacts..."
            class="pl-8"
            bind:value={searchQuery}
          />
        </div>

        {#if error}
          <div class="text-red-500">{error}</div>
        {/if}

        <div class="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead class="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#if loading}
                <TableRow>
                  <TableCell colspan="4" class="text-center"
                    >Loading...</TableCell
                  >
                </TableRow>
              {:else if filteredContacts.length === 0}
                <TableRow>
                  <TableCell colspan="4" class="text-center"
                    >No contacts found</TableCell
                  >
                </TableRow>
              {:else}
                {#each filteredContacts as contact}
                  <TableRow>
                    <TableCell>
                      {contact.firstname}
                      {contact.lastname}
                    </TableCell>
                    <TableCell>{contact.email || "-"}</TableCell>
                    <TableCell>{contact.phone || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => selectContact(contact)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                {/each}
              {/if}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" on:click={() => (isOpen = false)}
          >Cancel</Button
        >
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<Dialog.Root bind:open={showNewContactModal}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="bg-black/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <Dialog.Content class="sm:max-w-[500px]">
      <Dialog.Header>
        <Dialog.Title>New Contact</Dialog.Title>
        <Dialog.Description>
          Create a new contact to add to your property
        </Dialog.Description>
      </Dialog.Header>

      <ContactForm
        initialContact={{
          contact_type: selectedContactType
        }}
        on:save={handleNewContactSave}
      >
        <div slot="actions" class="flex justify-end gap-2">
          <Button
            variant="outline"
            onclick={() => showNewContactModal = false}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Contact"}
          </Button>
        </div>
      </ContactForm>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
