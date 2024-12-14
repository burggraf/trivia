<!-- +page.svelte -->
<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import Map from "$lib/components/map/Map.svelte";
  import MapPins from "$lib/components/map/MapPins.svelte";
  import maplibregl from "maplibre-gl";
  import { OverpassService } from "$lib/components/map/overpass";
  import {
    Coffee,
    ChefHat,
    Beer,
    Martini,
    Landmark,
    CircleDollarSign,
    PillBottle,
    Hospital,
    School,
    CircleParking,
  } from "lucide-svelte";
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
  }

  let map = $state<maplibregl.Map>();
  let places = $state<Array<any>>([]);
  let notification = $state<string | null>(null);

  // Clear notification when map moves
  $effect(() => {
    if (!map) return;

    const clearNotification = () => {
      notification = null;
    };

    map.on("move", clearNotification);

    return () => {
      if (!map) return;
      map.off("move", clearNotification);
    };
  });

  let locations = $derived(
    places.map(
      (place): MapLocation => ({
        lat: Number(place.lat),
        lng: Number(place.lon),
        title: place.tags?.name ?? undefined,
        details: place.tags as MapLocation["details"],
      }),
    ),
  );

  const locatePlaces = async (placeType: string) => {
    if (!map) return;

    // Clear existing places and notification
    places = [];
    notification = null;

    const center = map.getCenter();
    const overpass = new OverpassService();
    places = await overpass.findNearbyPlaces(
      { lat: center.lat, lon: center.lng },
      placeType,
      5000, // radius parameter (using default)
      10, // limit parameter - show 25 results
    );

    // If places were found, fit the map to show all pins
    if (places.length > 0) {
      // Find the bounds of all places
      const bounds = new maplibregl.LngLatBounds();
      places.forEach((place) => {
        bounds.extend([place.lon, place.lat]);
      });

      // Fit the map to the bounds with some padding
      map.fitBounds(bounds, {
        padding: 50, // Add 50px padding around the bounds
        maxZoom: 16, // Don't zoom in too far
      });
    } else {
      notification = `No ${placeType}s found in this area`;
    }
  };

  const actionItems: any[] = [
    {
      groupName: "Locate:",
      groupItems: [
        {
          icon: Coffee,
          label: "cafe",
          onClick: () => {
            locatePlaces("cafe");
          },
        },
        {
          icon: ChefHat,
          label: "restaurant",
          onClick: () => {
            locatePlaces("restaurant");
          },
        },
        {
          icon: Martini,
          label: "pub",
          onClick: () => {
            locatePlaces("pub");
          },
        },
        {
          icon: Beer,
          label: "bar",
          onClick: () => {
            locatePlaces("bar");
          },
        },
        {
          icon: CircleDollarSign,
          label: "atm",
          onClick: () => {
            locatePlaces("atm");
          },
        },
        {
          icon: Landmark,
          label: "bank",
          onClick: () => {
            locatePlaces("bank");
          },
        },
        {
          icon: PillBottle,
          label: "pharmacy",
          onClick: () => {
            locatePlaces("pharmacy");
          },
        },
        {
          icon: Hospital,
          label: "hospital",
          onClick: () => {
            locatePlaces("hospital");
          },
        },
        {
          icon: School,
          label: "school",
          onClick: () => {
            locatePlaces("school");
          },
        },
        {
          icon: CircleParking,
          label: "parking",
          onClick: () => {
            locatePlaces("parking");
          },
        },
      ],
    },
  ];
</script>

<PageTemplate {actionItems}>
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
