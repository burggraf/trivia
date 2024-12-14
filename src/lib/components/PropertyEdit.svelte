<script lang="ts">
  import type { Property } from "$lib/services/propertyService.svelte";
  import { upsertProperty } from "$lib/services/propertyService.svelte";
  import * as Select from "$lib/components/ui/select";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Save, Check } from "lucide-svelte";

  const { property = $bindable(), onSave = $bindable() } = $props<{
    property: Partial<Property>;
    onSave?: () => void;
  }>();

  let loading = $state(false);
  let error = $state<string | null>(null);

  async function saveProperty() {
    console.log("saveProperty", property);
    loading = true;
    error = null;

    const { error: err } = await upsertProperty(property);

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    loading = false;
    if (onSave) onSave();
  }

  const propertyTypes = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" },
  ];

  const propertySubtypes = [
    { value: "single_family", label: "Single Family" },
    { value: "multi_family", label: "Multi Family" },
    { value: "condo", label: "Condo" },
    { value: "townhouse", label: "Townhouse" },
    { value: "apartment", label: "Apartment" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
    { value: "industrial", label: "Industrial" },
    { value: "other", label: "Other" },
  ];

  const propertyTypeContent = $derived(
    propertyTypes.find((t) => t.value === property.property_type)?.label ??
      "Select property type",
  );

  const propertySubtypeContent = $derived(
    propertySubtypes.find((t) => t.value === property.property_subtype)
      ?.label ?? "Select property subtype",
  );
</script>

<div class="max-w-2xl mx-auto p-4 space-y-6">
  <!-- Basic Information -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Basic Information</h3>
    <div class="grid grid-cols-1 gap-4">
      <div class="space-y-2">
        <Label for="title">Title</Label>
        <Input
          id="title"
          bind:value={property.title}
          placeholder="Enter property title"
        />
      </div>
      <div class="space-y-2">
        <Label for="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          bind:value={property.subtitle}
          placeholder="Enter property subtitle"
        />
      </div>
    </div>
  </div>
  <!-- Address Information -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Address</h3>
    <div class="grid grid-cols-1 gap-4">
      <div class="space-y-2">
        <Label for="address">Address</Label>
        <Input id="address" bind:value={property.address} />
      </div>
      <div class="space-y-2">
        <Label for="address2">Address 2</Label>
        <Input id="address2" bind:value={property.address2} />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="city">City</Label>
          <Input id="city" bind:value={property.city} />
        </div>
        <div class="space-y-2">
          <Label for="region">Region</Label>
          <Input id="region" bind:value={property.region} />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="postal">Postal Code</Label>
          <Input id="postal" bind:value={property.postal} />
        </div>
        <div class="space-y-2">
          <Label for="country">Country</Label>
          <Input id="country" bind:value={property.country} />
        </div>
      </div>
    </div>
  </div>

  <!-- Property Type -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Property Type</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="property_type">Property Type</Label>
        <Select.Root type="single" bind:value={property.property_type}>
          <Select.Trigger class="w-full">
            {propertyTypeContent}
          </Select.Trigger>
          <Select.Content>
            {#each propertyTypes as type}
              <Select.Item value={type.value}>{type.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="space-y-2">
        <Label for="property_subtype">Property Subtype</Label>
        <Select.Root type="single" bind:value={property.property_subtype}>
          <Select.Trigger class="w-full">
            {propertySubtypeContent}
          </Select.Trigger>
          <Select.Content>
            {#each propertySubtypes as type}
              <Select.Item value={type.value}>{type.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </div>

  <!-- Property Details -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Property Details</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="beds">Bedrooms</Label>
        <Input id="beds" type="number" bind:value={property.beds} min="0" />
      </div>
      <div class="space-y-2">
        <Label for="baths">Bathrooms</Label>
        <Input
          id="baths"
          type="number"
          bind:value={property.baths}
          min="0"
          step="0.5"
        />
      </div>
      <div class="space-y-2">
        <Label for="living_area">Living Area (sq ft)</Label>
        <Input
          id="living_area"
          type="number"
          bind:value={property.living_area}
          min="0"
        />
      </div>
      <div class="space-y-2">
        <Label for="land_area">Land Area (sq ft)</Label>
        <Input
          id="land_area"
          type="number"
          bind:value={property.land_area}
          min="0"
        />
      </div>
      <div class="space-y-2">
        <Label for="year_built">Year Built</Label>
        <Input
          id="year_built"
          type="number"
          bind:value={property.year_built}
          min="1800"
          max={new Date().getFullYear()}
        />
      </div>
    </div>
  </div>

  <!-- Additional Information -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Additional Information</h3>
    <div class="space-y-2">
      <Label for="notes">Notes</Label>
      <Textarea
        id="notes"
        bind:value={property.notes}
        placeholder="Enter any additional notes about the property"
        rows="4"
      />
    </div>
  </div>

  {#if error}
    <div class="text-destructive mb-4">{error}</div>
  {/if}

  <div class="flex justify-end">
    <Button variant="secondary" onclick={saveProperty} disabled={loading}>
      <Save class="mr-2 h-4 w-4" />
      {loading ? "Saving..." : "Save"}
    </Button>
  </div>
</div>
