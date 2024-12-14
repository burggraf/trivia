<script lang="ts">
  import { page } from "$app/stores";
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import type { Property } from "$lib/services/propertyService.svelte";
  import {
    ArrowLeft,
    Edit,
    Check,
    Printer,
    Save,
    FileText,
  } from "lucide-svelte";
  import PropertyDetails from "@/components/PropertyDetails.svelte";
  import PropertyEdit from "$lib/components/PropertyEdit.svelte";
  import PropertyImages from "$lib/components/PropertyImages.svelte";
  import PropertyTransactions from "@/components/PropertyTransactions.svelte";
  import PropertyContacts from "$lib/components/PropertyContacts.svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import FlyerMaker from "$lib/components/FlyerMaker.svelte";
  import {
    upsertProperty,
    getPropertyById,
  } from "$lib/services/propertyService.svelte";
  import { getPDF } from "$lib/services/export.service.svelte";
  import { getCurrentOrg, getUser } from "$lib/services/backend.svelte";

  const user = $derived(getUser());
  const currentOrg = $derived(getCurrentOrg());
  const isNew = $derived($page.params.id === "new");
  const propertyId = $derived($page.params.id);
  let isEditing = $state(false);
  let flyerMakerOpen = $state(false);
  let showTransactionModal = $state(false);

  $effect(() => {
    // Set initial editing state based on isNew
    isEditing = isNew;
  });

  let property: Partial<Property> = $state({});

  $effect(() => {
    // Initialize property based on isNew condition
    property = isNew
      ? {
          property_type: "",
          property_subtype: "",
          address: "",
          address2: "",
          city: "",
          region: "",
          postal: "",
          country: "",
          beds: 0,
          baths: 0,
          living_area: 0,
          land_area: 0,
          year_built: new Date().getFullYear(),
          metadata: {},
        }
      : {};
  });

  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    load();
  });

  const loadProperty = async () => {
    const { data, error: err } = await getPropertyById(propertyId);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    property = data;
  };

  async function load() {
    if (isNew) return;

    loading = true;
    error = null;

    await loadProperty();

    loading = false;
  }

  function handleBack(event: MouseEvent) {
    goto("/properties");
  }

  async function handleSave() {
    loading = true;
    error = null;

    if (!user) {
      error = "You need to be logged in to save properties";
      loading = false;
      return;
    }

    if (!currentOrg) {
      error = "No organization selected";
      loading = false;
      return;
    }

    const { error: err } = await upsertProperty(user, currentOrg.id, property);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    isEditing = false;
    loading = false;
    await load();
  }

  async function handleCancel() {
    isEditing = false;
    if (!isNew) {
      loading = true;
      error = null;
      await loadProperty();
      loading = false;
    }
  }

  $effect(() => {
    load();
  });

  const exportPDF = async () => {
    console.log("exportPDF");
    // Get the property details container element
    const propertyContent =
      document.getElementById("property-details")?.innerHTML;
    console.log("propertyContent", propertyContent);
    if (propertyContent) {
      // Generate a title for the PDF
      const title = `Property_${property.address || "Details"}_${new Date().toISOString().split("T")[0]}`;
      const pdf = await getPDF(propertyContent, title);
      console.log("pdf", pdf);

      // Create a URL for the PDF blob
      const url = URL.createObjectURL(pdf);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
    }
  };

  let currentTab = $state("details");

  const pageTitle = $derived(
    currentTab === "details"
      ? "Property Details"
      : currentTab === "images"
        ? "Property Images"
        : currentTab === "contacts"
          ? "Property Contacts"
          : currentTab === "transactions"
            ? "Property Transactions"
            : "Property",
  );

  const detailsActionItems = $derived([
    {
      icon: Edit,
      label: "Edit",
      onClick: () => (isEditing = true),
      show: !isEditing && !isNew,
    },
    {
      icon: ArrowLeft,
      label: "Cancel",
      onClick: handleCancel,
      show: isEditing && !isNew,
    },
    {
      icon: Check,
      label: "Save",
      onClick: handleSave,
      show: isEditing || isNew,
    },
    {
      icon: FileText,
      label: "Create Flyer",
      onClick: () => (flyerMakerOpen = true),
      show: !isEditing && !isNew,
    },
  ]);

  const imageActionItems = [
    {
      icon: FileText,
      label: "Upload Images",
      onClick: () => document.getElementById("image-upload")?.click(),
      get show() {
        return !isNew;
      },
    },
  ];

  const transactionActionItems = [
    {
      icon: FileText,
      label: "Add Transaction",
      onClick: handleTransactionModalOpen,
      get show() {
        return !isNew;
      }, // Use a getter to maintain reactivity
    },
  ];

  const contactsActionItems = [];

  const actionItems = $derived(
    currentTab === "details"
      ? detailsActionItems
      : currentTab === "images"
        ? imageActionItems
        : currentTab === "contacts"
          ? contactsActionItems
          : currentTab === "transactions"
            ? transactionActionItems
            : [],
  );

  function handleTransactionModalOpen() {
    showTransactionModal = true;
  }

  function handleTransactionModalClose() {
    showTransactionModal = false;
  }
</script>

<PageTemplate {actionItems}>
  {#snippet TopLeft()}
    <Button variant="ghost" size="icon" onclick={() => goto("/properties")}>
      <ArrowLeft class="h-4 w-4" />
    </Button>
  {/snippet}

  {#snippet TopCenter()}
    {pageTitle}
  {/snippet}

  {#snippet Middle()}
    {#if loading}
      <div class="flex items-center justify-center h-full">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
      </div>
    {:else if error}
      <div class="text-red-500 p-4">{error}</div>
    {:else}
      <div class="flex items-center justify-center">
        <Tabs.Root
          value="details"
          class="w-[350px] md:w-full"
          onValueChange={(value) => (currentTab = value)}
        >
          <Tabs.List class="grid w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
            <Tabs.Trigger
              value="details"
              class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Details
            </Tabs.Trigger>
            <Tabs.Trigger
              value="images"
              class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Images
            </Tabs.Trigger>
            <Tabs.Trigger
              value="contacts"
              class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Contacts
            </Tabs.Trigger>
            <Tabs.Trigger
              value="transactions"
              class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Transactions
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="details" class="mt-0 border-0 p-0">
            {#if isEditing}
              <PropertyEdit bind:property onSave={handleSave} />
            {:else}
              <PropertyDetails {property} />
            {/if}
          </Tabs.Content>

          <Tabs.Content value="images" class="mt-0 border-0 p-0">
            <PropertyImages {property} onReload={load} />
          </Tabs.Content>

          <Tabs.Content value="contacts" class="mt-0 border-0 p-0">
            <PropertyContacts {property} />
          </Tabs.Content>

          <Tabs.Content value="transactions" class="mt-0 border-0 p-0">
            <PropertyTransactions 
              {property} 
              {showTransactionModal} 
              onOpenModal={handleTransactionModalOpen}
              onModalClose={handleTransactionModalClose} 
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    {/if}
  {/snippet}
</PageTemplate>

<FlyerMaker {property} bind:open={flyerMakerOpen} />
