<script lang="ts">
  import { Plus, Trash2 } from "lucide-svelte";
  import type {
    Property,
    PropertyContact,
  } from "$lib/services/propertyService.svelte";
  import {
    getPropertyContactsByPropertyId,
    upsertPropertyContact,
    deletePropertyContact,
  } from "$lib/services/propertyService.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import ContactPicker from "$lib/components/ContactPicker.svelte";
  import { getCurrentGroup } from "$lib/services/backend.svelte";
  import { alertManager } from "$lib/components/ui/alert/alert.svelte.ts";
  import { loadingState } from "$lib/components/loading/loading-state.svelte.ts";
  import { toast } from "svelte-sonner";

  const { property } = $props<{ property: Property }>();
  const currentGroup = $derived(getCurrentGroup());

  let contacts = $state<PropertyContact[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    console.log("PropertyContacts");
  });

  async function loadContacts() {
    if (!property.id) return;

    loading = true;
    error = null;

    const { data, error: err } = await getPropertyContactsByPropertyId(
      property.id,
    );

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    contacts = data || [];
    loading = false;
  }

  async function handleContactSelect(
    event: CustomEvent<{ id: string; contact_type: string }>,
  ) {
    console.log(
      "PropertyContacts: handleContactSelect called with event",
      event,
    );
    console.log("PropertyContacts: event detail", event.detail);

    if (!property.id) {
      console.error("PropertyContacts: No property.id");
      return;
    }
    if (!currentGroup) {
      console.error("PropertyContacts: No group selected");
      error = "No group selected";
      return;
    }

    const { id: contactId, contact_type } = event.detail;
    console.log("PropertyContacts: extracted contactId and contact_type", {
      contactId,
      contact_type,
    });

    const newPropertyContact = {
      propertyid: property.id,
      contactid: contactId,
      groupid: currentGroup.id,
      contact_type,
    };

    console.log(
      "PropertyContacts: upserting property contact",
      newPropertyContact,
    );
    const { error: err } = await upsertPropertyContact(newPropertyContact);

    if (err) {
      console.error("PropertyContacts: Error upserting property contact:", err);
      error = err.message;
      return;
    }

    console.log(
      "PropertyContacts: Successfully added contact, reloading contacts...",
    );
    await loadContacts();
  }

  async function handleDeleteContact(id: string) {
    if (!id) {
      console.error("PropertyContacts: No contact id provided");
      return;
    }

    const result = await alertManager.show({
      title: "Confirm Delete",
      message:
        "Are you sure you want to remove this contact from the property?",
      buttons: [
        { label: "Cancel", value: "cancel", variant: "outline" },
        { label: "Delete", value: "delete", variant: "destructive" },
      ],
    });

    if (result === "delete") {
      loadingState.show("Removing contact...");
      const { error: err } = await deletePropertyContact(id);
      loadingState.hide();

      if (err) {
        toast.error("ERROR", { description: err.message });
        return;
      }

      toast.success("SUCCESS", {
        description: "Contact removed from property",
      });
      await loadContacts();
    }
  }

  // Load contacts when property changes
  $effect(() => {
    if (property.id) {
      loadContacts();
    }
  });
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h3 class="text-lg font-medium">Property Contacts</h3>
    <ContactPicker on:select={handleContactSelect}>
      <Button variant="outline" size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Add Contact
      </Button>
    </ContactPicker>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-4">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>
  {:else if error}
    <div class="text-destructive">{error}</div>
  {:else if contacts.length === 0}
    <div class="text-center py-4 text-muted-foreground">
      <p>No contacts associated with this property</p>
      <p class="text-sm">Click "Add Contact" to associate a contact</p>
    </div>
  {:else}
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead class="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each contacts as contact}
          <TableRow>
            <TableCell>
              {contact.contacts.firstname}
              {contact.contacts.lastname}
            </TableCell>
            <TableCell>{contact.contacts.email}</TableCell>
            <TableCell>{contact.contacts.phone}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onclick={(e) => {
                  e.preventDefault();
                  console.log("Delete button clicked for contact:", contact.id);
                  handleDeleteContact(contact.id);
                }}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</div>
