<!-- +page.svelte -->
<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import Map from "$lib/components/map/Map.svelte";
  import MapPins from "$lib/components/map/MapPins.svelte";
  import maplibregl from "maplibre-gl";
  import { Coffee } from "lucide-svelte";
  import {
    getOrgProperties,
    type Property,
  } from "@/services/propertyService.svelte";
  import { getCurrentOrg } from "@/services/backend.svelte";

  interface MapLocation {
    lat: number;
    lng: number;
    title?: string;
    details?: {
      [key: string]: string | undefined;
      "addr:housenumber"?: string;
      "addr:street"?: string;
      "addr:postcode"?: string;
      name?: string;
      opening_hours?: string;
      phone?: string;
    };
    property: Property;
  }

  const currentOrg = $derived(getCurrentOrg());
  let map = $state<maplibregl.Map>();
  let notification = $state<string | null>(null);

  // Clear notification when map moves
  $effect(() => {
    if (!map) return;
    loadProperties();
    const clearNotification = () => {
      notification = null;
    };

    map.on("move", clearNotification);

    return () => {
      if (!map) return;
      map.off("move", clearNotification);
    };
  });

  let properties = $state<Property[]>([]);
  let error = $state<string | null>(null);

  async function loadProperties() {
    if (!map) return;
    if (!currentOrg?.id) {
      error = "No organization selected";
      return;
    }

    error = null;
    notification = null;

    const { data, error: err } = await getOrgProperties(currentOrg.id);
    console.log("data", data);
    console.log("err", err);
    if (err) {
      error = err.message;
      return;
    }

    properties = data || [];
    const center = map.getCenter();

    // If places were found, fit the map to show all pins
    if (properties.length > 0) {
      // Find the bounds of all places
      const bounds = new maplibregl.LngLatBounds();
      properties.forEach((place) => {
        bounds.extend([place.lng, place.lat]);
      });

      // Fit the map to the bounds with some padding
      map.fitBounds(bounds, {
        padding: 50, // Add 50px padding around the bounds
        maxZoom: 16, // Don't zoom in too far
      });
    } else {
      notification = `No properties found in this area`;
    }
  }
  let locations = $derived(
    properties.map(
      (place): MapLocation => ({
        lat: Number(place.lat),
        lng: Number(place.lng),
        title: place.address || "unknown address",
        property: place,
      }),
    ),
  );
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Interactive Map
    {#if notification}
      <div class="notification">
        {notification}
      </div>
    {/if}
  {/snippet}

  {#snippet Middle()}
    <div class="map-wrapper">
      <Map bind:map>
        {#snippet content()}
          <MapPins {locations} {map} />
        {/snippet}
      </Map>
    </div>
  {/snippet}
</PageTemplate>

<style>
  .map-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(100vh - var(--header-height) - var(--footer-height));
    margin: -1rem;
  }
  .notification {
    position: absolute;
    top: 4rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
</style>
