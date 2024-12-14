<!-- MapPins.svelte -->
<script lang="ts">
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import PropertyDetailsModal from "../PropertyDetailsModal.svelte";
  import { writable } from "svelte/store";

  interface Props {
    locations: Array<{
      lat: number;
      lng: number;
      title?: string;
      property?: any; // This will be the full property object
    }>;
    map?: maplibregl.Map;
  }
  const { locations = [], map } = $props<Props>();
  const currentMarkers: maplibregl.Marker[] = [];

  const modalState = writable({
    selectedProperty: null as any,
    isOpen: false,
  });

  function createPopupHTML(location: Props["locations"][0]) {
    if (!location.property) {
      return `<h3>${location.title || "Unnamed Location"}</h3>`;
    }

    const { address, city, status, list_price, beds, baths } =
      location.property;

    // Base64 encode the property data to avoid any escaping issues
    const propertyData = btoa(JSON.stringify(location.property));

    return `
      <div class="popup-content">
        <h3>${address || "No Address"}</h3>
        <p class="city">${city || ""}</p>
        <p class="status">${status || ""}</p>
        <p class="price">$${(list_price || 0).toLocaleString()}</p>
        <div class="specs">
          <span>${beds || 0} beds</span>
          <span>${baths || 0} baths</span>
        </div>
        <button 
          class="view-details-btn"
          data-property="${propertyData}"
          onclick="(function(btn) {
            console.log('Button clicked');
            const data = JSON.parse(atob(btn.dataset.property));
            console.log('Property data:', data);
            window.__openPropertyModal(data);
          })(this)">
          View Details
        </button>
      </div>
    `;
  }

  // Create markers for each location
  $effect(() => {
    if (!map) return;

    // Remove existing markers
    while (currentMarkers.length > 0) {
      const marker = currentMarkers.pop();
      marker?.remove();
    }

    // Add new markers only if we have locations
    if (locations.length > 0) {
      locations.forEach((location) => {
        const marker = new maplibregl.Marker({ className: "map-marker" })
          .setLngLat([location.lng, location.lat])
          .addTo(map);

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          className: "property-popup",
          maxWidth: "none",
        }).setHTML(createPopupHTML(location));

        marker.setPopup(popup);
        currentMarkers.push(marker);
      });
    }
  });

  // Add the function to window object for the popup to access
  $effect(() => {
    (window as any).__openPropertyModal = (property: any) => {
      console.log("Opening modal with property:", property);
      modalState.set({
        selectedProperty: property,
        isOpen: true,
      });
    };

    return () => {
      delete (window as any).__openPropertyModal;
    };
  });

  // Debug effect to log state changes
  $effect(() => {
    const unsubscribe = modalState.subscribe((state) => {
      console.log("Modal state updated:", state);
    });

    return unsubscribe;
  });
</script>

<!-- Mount the modal in a portal to ensure it's at the root level -->
<div class="modal-container">
  <PropertyDetailsModal
    property={$modalState.selectedProperty}
    isOpen={$modalState.isOpen}
    on:update:isOpen={(e) =>
      modalState.update((state) => ({ ...state, isOpen: e.detail }))}
  />
</div>

<style>
  :global(.property-popup .maplibregl-popup-content) {
    background-color: white;
    color: black;
    border: 1px solid var(--border);
  }

  :global(.dark .property-popup .maplibregl-popup-content) {
    background-color: black;
    color: white;
    border-color: #333;
  }

  :global(.property-popup .maplibregl-popup-tip) {
    border-top-color: white !important;
    border-bottom-color: white !important;
  }

  :global(.dark .property-popup .maplibregl-popup-tip) {
    border-top-color: black !important;
    border-bottom-color: black !important;
  }

  :global(.popup-content) {
    padding: 12px;
    min-width: 200px;
  }

  :global(.popup-content h3) {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }

  :global(.popup-content p) {
    margin: 4px 0;
    font-size: 14px;
  }

  :global(.popup-content .city) {
    color: #666;
  }

  :global(.dark .popup-content .city) {
    color: #a1a1aa;
  }

  :global(.popup-content .status) {
    text-transform: capitalize;
    color: #2563eb;
    font-weight: 500;
  }

  :global(.dark .popup-content .status) {
    color: #60a5fa;
  }

  :global(.popup-content .price) {
    font-weight: 600;
    font-size: 16px;
    margin: 8px 0;
  }

  :global(.popup-content .specs) {
    display: flex;
    gap: 12px;
    color: #666;
  }

  :global(.dark .popup-content .specs) {
    color: #a1a1aa;
  }

  :global(.view-details-btn) {
    margin-top: 8px;
    padding: 4px 8px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }

  :global(.view-details-btn:hover) {
    background-color: #357abd;
  }

  .modal-container {
    position: relative;
    z-index: 9999;
  }
</style>
