<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { Plus } from "lucide-svelte";
  import { Search } from "lucide-svelte";
  import type { Contact } from "$lib/services/contactService.svelte";
  import { getContacts } from "$lib/services/contactService.svelte";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Input } from "$lib/components/ui/input";

  const actionItems = [
    {
      groupName: "Contacts",
      groupItems: [
        {
          icon: Plus,
          label: "Add Contact",
          onClick: async () => {
            goto("/contacts/new");
          },
        },
      ],
    },
  ];

  let contacts = $state<Contact[]>([]);
  let filteredContacts = $state<Contact[]>([]);
  let searchQuery = $state("");
  let searchTimeout: ReturnType<typeof setTimeout>;
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadContacts() {
    loading = true;
    error = null;

    const { data, error: err } = await getContacts();
    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    contacts = data || [];
    loading = false;
  }

  function filterContacts() {
    if (!searchQuery.trim()) {
      filteredContacts = contacts;
      return;
    }

    const query = searchQuery?.toLowerCase() ?? "";
    filteredContacts = contacts.filter((contact) => {
      const searchFields = [
        contact.firstname,
        contact.lastname,
        contact.email,
      ];
      return searchFields.some((field) => field?.toLowerCase().includes(query));
    });
  }

  $effect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (searchQuery !== undefined) {
      searchTimeout = setTimeout(filterContacts, 500);
    }
  });

  $effect(() => {
    filteredContacts = contacts;
  });

  $effect(() => {
    loadContacts();
  });
</script>

<PageTemplate {actionItems}>
  {#snippet TopCenter()}
    Contacts
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
    {:else if contacts.length === 0}
      <div
        class="flex flex-col items-center justify-center h-full text-muted-foreground"
      >
        <p>No contacts yet</p>
        <p class="text-sm">
          Click the "Add Contact" button to create your first contact
        </p>
      </div>
    {:else}
      <div class="p-4 space-y-4">
        {#if contacts.length > 3}
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
        {/if}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-full">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each filteredContacts as contact}
              <TableRow
                class="cursor-pointer hover:bg-muted/50"
                onclick={() => goto(`/contacts/${contact.id}`)}
              >
                <TableCell>
                  <div class="space-y-1">
                    <div class="font-medium">
                      <a
                        href="/contacts/{contact.id}"
                        class="hover:underline"
                      >
                        {[contact.firstname, contact.lastname].filter(Boolean).join(" ")}
                      </a>
                    </div>
                    <div class="text-sm text-gray-500">
                      {contact.email || "—"}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>
    {/if}
  {/snippet}
</PageTemplate>
