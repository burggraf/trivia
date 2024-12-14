<script lang="ts">
  import type { Property } from "$lib/services/propertyService.svelte";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Printer, FileText } from "lucide-svelte";
  import { getPDF, getDOC } from "$lib/services/export.service.svelte";
  import { cn } from "$lib/utils";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let { property, open = $bindable() } = $props<{
    property: Property;
    open: boolean;
  }>();

  let selectedStyle = $state("modern");
  const image = $derived(property?.metadata?.images?.[0]?.url || "");
  const flyerStyles = [
    {
      id: "modern",
      name: "Modern Minimal",
      description: "Clean and contemporary design with emphasis on typography",
    },
    {
      id: "luxury",
      name: "Luxury Estate",
      description: "Elegant and sophisticated layout for high-end properties",
    },
  ];

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleExportPDF = async () => {
    const content = document.getElementById("flyer-content");
    if (content) {
      const pdf = await getPDF(content.innerHTML, `${property.address}-flyer`);
      if (pdf) {
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${property.address}-flyer.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleExportDOC = async () => {
    const content = document.getElementById("flyer-content");
    if (content) {
      const doc = await getDOC(content.innerHTML, `${property.address}-flyer`);
      if (doc) {
        const url = URL.createObjectURL(doc);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${property.address}-flyer.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };
</script>

<Dialog {open}>
  <DialogContent class="max-w-6xl h-[80vh]">
    <DialogHeader>
      <DialogTitle>Flyer Maker</DialogTitle>
      <div class="flex gap-2">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Button variant="outline" size="icon" onclick={handleExportPDF}>
                <Printer class="h-4 w-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Export to PDF</p>
            </Tooltip.Content>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Button variant="outline" size="icon" onclick={handleExportDOC}>
                <FileText class="h-4 w-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Export to Word</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </DialogHeader>

    <div class="grid grid-cols-[250px_1fr] gap-6 h-full overflow-hidden">
      <!-- Style Selector -->
      <div class="border-r pr-4 space-y-4 overflow-y-auto">
        <h3 class="font-semibold text-lg">Flyer Styles</h3>
        <div class="space-y-2">
          {#each flyerStyles as style}
            <button
              class={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                selectedStyle === style.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
              onclick={() => (selectedStyle = style.id)}
            >
              <div class="font-medium">{style.name}</div>
              <div class="text-sm opacity-80">{style.description}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Preview Area -->
      <div class="overflow-y-auto px-4" id="flyer-content">
        {#if selectedStyle === "modern"}
          <!-- Modern Minimal Layout -->
          <div class="max-w-3xl mx-auto bg-white p-8 shadow-lg">
            {#if image}
              <img
                src={image}
                alt={property.title}
                class="w-full h-[400px] object-cover rounded-lg mb-8"
              />
            {/if}

            <div class="space-y-6">
              <h1 class="text-4xl font-light tracking-tight">
                {property.title ||
                  `${property.property_type} in ${property.city}`}
              </h1>

              <div class="text-3xl font-light text-primary">
                {formatPrice(property.price)}
              </div>

              <div class="grid grid-cols-2 gap-4 text-lg">
                <div>
                  <span class="font-medium">Location:</span><br />
                  {property.address}
                  {#if property.address2}, {property.address2}{/if}
                </div>
                <div>
                  <span class="font-medium">Property Type:</span><br />
                  {property.property_type}
                </div>
              </div>

              <p class="text-gray-600 text-lg leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>
        {:else if selectedStyle === "luxury"}
          <!-- Luxury Estate Layout -->
          <div class="max-w-3xl mx-auto bg-[#1a1a1a] text-white p-12 shadow-xl">
            <div class="border border-gold p-8">
              {#if image}
                <img
                  src={image}
                  alt={property.title}
                  class="w-full h-[400px] object-cover mb-8"
                />
              {/if}

              <div class="text-center space-y-6">
                <h1 class="text-5xl font-serif tracking-wide">
                  {property.title ||
                    `${property.property_type} in ${property.city}`}
                </h1>

                <div class="text-4xl font-light text-gold">
                  {formatPrice(property.price)}
                </div>

                <div class="w-24 h-[1px] bg-gold mx-auto my-8"></div>

                <div class="grid grid-cols-2 gap-8 text-lg max-w-2xl mx-auto">
                  <div>
                    <span class="text-gold uppercase tracking-wider text-sm"
                      >Location</span
                    >
                    <p class="mt-2">
                      {property.address}
                      {#if property.address2}, {property.address2}{/if}
                    </p>
                  </div>
                  <div>
                    <span class="text-gold uppercase tracking-wider text-sm"
                      >Property Type</span
                    >
                    <p class="mt-2">{property.property_type}</p>
                  </div>
                </div>

                <p
                  class="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mt-8"
                >
                  {property.description}
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </DialogContent>
</Dialog>

<style>
  .text-gold {
    color: #c5a572;
  }

  .border-gold {
    border-color: #c5a572;
  }

  .bg-gold {
    background-color: #c5a572;
  }
</style>
